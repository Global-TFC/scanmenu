"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts, ProductResult } from "@/actions/get-products";
import { useInView } from "react-intersection-observer";

// Define the Product interface matching what the templates expect
// We might need to adapt this if templates have slightly different needs,
// but for now we align with the Server Action result.
export interface Product extends ProductResult {
  rating?: number;
  reviews?: number;
}

interface UseProductsProps {
  initialProducts: Product[];
  slug: string;
}

export function useProducts({ initialProducts, slug }: UseProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Assume true initially if full page, but logic below refines it
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Reset pagination when filter changes
  useEffect(() => {
    // If we are just starting (page 1) and searchTerm/Category match initial state (empty/All),
    // and we have initialProducts, we don't need to fetch immediately?
    // Actually, handling initial state vs filtered state is tricky.
    // Simplest approach:
    // If filters change, we reset everything and fetch page 1.
    // BUT, we want to avoid double fetching on mount.
    
    // We can use a ref to track if it's the first mount?
    // Or just fetch immediately if filters are applied.
    
    // Let's just create a debounce for search if needed, but for now simple effect.
    
    const fetchFirstPage = async () => {
      setLoading(true);
      const res = await getProducts({
        slug,
        page: 1,
        search: searchTerm,
        category: selectedCategory,
      });
      setProducts(res.products);
      setHasMore(res.hasMore);
      setPage(1);
      setLoading(false);
    };

    // Only fetch if we are NOT using the initial data passed from server.
    // However, the initial data is for "All" categories and "" search.
    // If user changes search or category, we MUST fetch.
    // If search is "" and category is "All", we *could* rely on initialProducts
    // IF we haven't paginated yet.
    
    // Let's check if we strictly need to fetch.
    if (searchTerm === "" && selectedCategory === "All" && page === 1 && products === initialProducts) {
       // Do nothing, we have initial data
       // But wait, what if we went away and came back?
    } else {
       // We should fetch
       fetchFirstPage();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, slug]); 
  // removed page and products from deps to avoid loops, this effect is for FILTER changes

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const res = await getProducts({
      slug,
      page: nextPage,
      search: searchTerm,
      category: selectedCategory,
    });

    setProducts((prev) => [...prev, ...res.products]);
    setHasMore(res.hasMore);
    setPage(nextPage);
    setLoading(false);
  }, [slug, page, hasMore, loading, searchTerm, selectedCategory]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  // Extract categories from INITIAL products? 
  // No, if we filter, we might lose categories.
  // Ideally, valid categories should come from the server or derive from ALL products.
  // Since we don't have all products, we might need to derive from initial set OR 
  // fetch distinct categories separately.
  // For now, let's derive from the products we HAVE seen (or just initialProducts if that's the full sample of logic).
  // Actually, standard practice for infinite scroll is:
  // 1. Categories usually static or fetched once.
  // 2. We can use initialProducts to get categories, assuming the initial batch covers main ones 
  //    or we accept that some categories might appear later.
  // Better: Let's assume the passed `initialProducts` (or a separate prop if we could) has enough info.
  // Or we just stick to what `useMemo` did before, but using `products` might be limited if we are in a filtered view.
  // Let's use `initialProducts` specifically for deriving categories list to keep it stable-ish?
  // Warning: if initial batch doesn't have a category, it won't show in filter.
  // We'll stick to `products` for now, or maybe the component should ask for all categories separately.
  // Let's use a Set of all unique categories seen so far in the session.
  
  const categories = useMemo(() => {
    // Unique categories from ALL loaded products + "All"
    // (Ideally we'd want ALL possible categories from DB, but that's a separate query)
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  return {
    products,
    loading,
    hasMore,
    loadMoreRef: ref,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories
  };
}
