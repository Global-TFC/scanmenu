"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getProducts, ProductResult } from "@/actions/get-products";
import { getCategories } from "@/actions/get-categories";
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
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  // Check if initialProducts suggests there might be more (assuming PAGE_SIZE is 10)
  const [hasMore, setHasMore] = useState(initialProducts.length >= 10);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Debounce search term - 400ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const cats = await getCategories(slug);
            setDbCategories(cats);
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    };
    fetchCats();
  }, [slug]);

  // Reset pagination when filter changes (uses debounced search)
  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      const res = await getProducts({
        slug,
        page: 1,
        search: debouncedSearchTerm,
        category: selectedCategory,
      });
      setProducts(res.products);
      setHasMore(res.hasMore);
      setPage(1);
      setLoading(false);
    };

    if (debouncedSearchTerm === "" && selectedCategory === "All" && page === 1 && products === initialProducts) {
       // Do nothing, we have initial data
    } else {
       // We should fetch
       fetchFirstPage();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory, slug]); 

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const res = await getProducts({
      slug,
      page: nextPage,
      search: debouncedSearchTerm,
      category: selectedCategory,
    });

    setProducts((prev) => [...prev, ...res.products]);
    setHasMore(res.hasMore);
    setPage(nextPage);
    setLoading(false);
  }, [slug, page, hasMore, loading, debouncedSearchTerm, selectedCategory]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  const categories = useMemo(() => {
    // Merge DB categories and current products' categories to ensure coverage
    const productCategories = new Set(products.map(p => p.category));
    const dbCategoryNames = new Set(dbCategories.map(c => c.name));
    
    const combined = new Set([...Array.from(dbCategoryNames), ...Array.from(productCategories)]);
    combined.delete("All"); // Remove explicit "All" if present in data
    
    const sorted = Array.from(combined).filter(Boolean).sort();
    return ["All", ...sorted];
  }, [products, dbCategories]);

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
