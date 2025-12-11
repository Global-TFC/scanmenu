"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  getProducts, 
  getFeaturedProducts, 
  getRegularProducts, 
  ProductResult 
} from "@/actions/get-products";
import { getCategories } from "@/actions/get-categories";
import { useInView } from "react-intersection-observer";
import { productCache } from "@/lib/product-cache";

// Define the Product interface matching what the templates expect
export interface Product extends ProductResult {
  rating?: number;
  reviews?: number;
}

interface UseProductsProps {
  initialProducts: Product[];
  slug: string;
}

// Updated return interface for dual product management
interface UseProductsReturn {
  // Featured products (no pagination)
  featuredProducts: Product[];
  featuredLoading: boolean;
  featuredError: string | null;
  
  // Regular products (with pagination)
  regularProducts: Product[];
  regularLoading: boolean;
  regularError: string | null;
  hasMore: boolean;
  loadMoreRef: (node?: Element | null) => void;
  
  // Shared filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  
  // Retry functions
  retryFeaturedProducts: () => void;
  retryRegularProducts: () => void;
  
  // Legacy support - combined products for backward compatibility
  products: Product[];
  loading: boolean;
}

export function useProducts({ initialProducts, slug }: UseProductsProps): UseProductsReturn {
  // Separate state for featured and regular products
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [regularProducts, setRegularProducts] = useState<Product[]>([]);
  
  // Separate loading states
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [regularLoading, setRegularLoading] = useState(false);
  
  // Error states
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [regularError, setRegularError] = useState<string | null>(null);
  
  // Regular products pagination state
  const [regularPage, setRegularPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Categories and filters
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Request deduplication flags
  const [featuredRequestInProgress, setFeaturedRequestInProgress] = useState(false);
  const [regularRequestInProgress, setRegularRequestInProgress] = useState(false);

  // Initialize with separated initial products
  useEffect(() => {
    const featured = initialProducts.filter(p => p.isFeatured);
    const regular = initialProducts.filter(p => !p.isFeatured);
    
    setFeaturedProducts(featured);
    setRegularProducts(regular);
    
    // Set hasMore based on regular products count (assuming PAGE_SIZE is 10)
    setHasMore(regular.length >= 10);
  }, [initialProducts]);

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

  // Fetch featured products (priority fetch) with caching
  const fetchFeaturedProducts = useCallback(async () => {
    if (featuredRequestInProgress) return;
    
    // Check cache first
    const cached = productCache.getFeaturedProducts(slug, debouncedSearchTerm, selectedCategory);
    if (cached) {
      setFeaturedProducts(cached.products);
      setFeaturedError(null);
      return;
    }
    
    setFeaturedRequestInProgress(true);
    setFeaturedLoading(true);
    setFeaturedError(null);
    
    try {
      const res = await getFeaturedProducts({
        slug,
        search: debouncedSearchTerm,
        category: selectedCategory,
      });
      
      setFeaturedProducts(res.products);
      setFeaturedError(null);
      
      // Cache the results
      productCache.setFeaturedProducts(slug, debouncedSearchTerm, selectedCategory, res.products);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load featured products";
      setFeaturedError(errorMessage);
      
      // Don't clear existing products on error - keep showing cached/previous data
      if (featuredProducts.length === 0) {
        setFeaturedProducts([]);
      }
    } finally {
      setFeaturedLoading(false);
      setFeaturedRequestInProgress(false);
    }
  }, [slug, debouncedSearchTerm, selectedCategory, featuredRequestInProgress, featuredProducts.length]);

  // Fetch regular products first page with caching
  const fetchRegularProductsFirstPage = useCallback(async () => {
    if (regularRequestInProgress) return;
    
    // Check cache first
    const cached = productCache.getRegularProducts(slug, debouncedSearchTerm, selectedCategory, 1);
    if (cached) {
      setRegularProducts(cached.products);
      setHasMore(cached.hasMore);
      setRegularPage(1);
      setRegularError(null);
      return;
    }
    
    setRegularRequestInProgress(true);
    setRegularLoading(true);
    setRegularError(null);
    
    try {
      const res = await getRegularProducts({
        slug,
        page: 1,
        search: debouncedSearchTerm,
        category: selectedCategory,
      });
      
      setRegularProducts(res.products);
      setHasMore(res.hasMore);
      setRegularPage(1);
      setRegularError(null);
      
      // Cache the results
      productCache.setRegularProducts(slug, debouncedSearchTerm, selectedCategory, 1, res.products, res.hasMore);
    } catch (error) {
      console.error("Failed to fetch regular products:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load products";
      setRegularError(errorMessage);
      
      // Don't clear existing products on error - keep showing cached/previous data
      if (regularProducts.length === 0) {
        setRegularProducts([]);
        setHasMore(false);
      }
    } finally {
      setRegularLoading(false);
      setRegularRequestInProgress(false);
    }
  }, [slug, debouncedSearchTerm, selectedCategory, regularRequestInProgress, regularProducts.length]);

  // Load more regular products (infinite scroll) with caching
  const loadMoreRegularProducts = useCallback(async () => {
    if (regularLoading || !hasMore || regularRequestInProgress) return;

    const nextPage = regularPage + 1;
    
    // Check cache first
    const cached = productCache.getRegularProducts(slug, debouncedSearchTerm, selectedCategory, nextPage);
    if (cached) {
      setRegularProducts((prev) => [...prev, ...cached.products]);
      setHasMore(cached.hasMore);
      setRegularPage(nextPage);
      return;
    }

    setRegularRequestInProgress(true);
    setRegularLoading(true);
    
    try {
      const res = await getRegularProducts({
        slug,
        page: nextPage,
        search: debouncedSearchTerm,
        category: selectedCategory,
      });

      setRegularProducts((prev) => [...prev, ...res.products]);
      setHasMore(res.hasMore);
      setRegularPage(nextPage);
      
      // Cache the results
      productCache.setRegularProducts(slug, debouncedSearchTerm, selectedCategory, nextPage, res.products, res.hasMore);
    } catch (error) {
      console.error("Failed to load more regular products:", error);
      // Don't update hasMore on error - allow retry
      const errorMessage = error instanceof Error ? error.message : "Failed to load more products";
      setRegularError(errorMessage);
    } finally {
      setRegularLoading(false);
      setRegularRequestInProgress(false);
    }
  }, [slug, regularPage, hasMore, regularLoading, debouncedSearchTerm, selectedCategory, regularRequestInProgress]);

  // Reset and fetch both product types when filters change
  useEffect(() => {
    const shouldFetch = debouncedSearchTerm !== "" || selectedCategory !== "All" || 
                       (debouncedSearchTerm === "" && selectedCategory === "All" && 
                        (featuredProducts.length === 0 && regularProducts.length === 0));

    if (shouldFetch) {
      // Fetch featured products first (priority)
      fetchFeaturedProducts().then(() => {
        // Then fetch regular products
        fetchRegularProductsFirstPage();
      });
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory, slug]);

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView) {
      loadMoreRegularProducts();
    }
  }, [inView, loadMoreRegularProducts]);

  // Calculate categories from both featured and regular products + DB categories
  const categories = useMemo(() => {
    const featuredCategories = new Set(featuredProducts.map(p => p.category));
    const regularCategories = new Set(regularProducts.map(p => p.category));
    const dbCategoryNames = new Set(dbCategories.map(c => c.name));
    
    const combined = new Set([
      ...Array.from(dbCategoryNames), 
      ...Array.from(featuredCategories),
      ...Array.from(regularCategories)
    ]);
    combined.delete("All"); // Remove explicit "All" if present in data
    
    const sorted = Array.from(combined).filter(Boolean).sort();
    return ["All", ...sorted];
  }, [featuredProducts, regularProducts, dbCategories]);

  // Legacy support - combined products and loading state
  const products = useMemo(() => {
    return [...featuredProducts, ...regularProducts];
  }, [featuredProducts, regularProducts]);

  const loading = featuredLoading || regularLoading;

  // Retry functions
  const retryFeaturedProducts = useCallback(() => {
    setFeaturedError(null);
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const retryRegularProducts = useCallback(() => {
    setRegularError(null);
    fetchRegularProductsFirstPage();
  }, [fetchRegularProductsFirstPage]);

  return {
    // New dual product management interface
    featuredProducts,
    featuredLoading,
    featuredError,
    regularProducts,
    regularLoading,
    regularError,
    hasMore,
    loadMoreRef: ref,
    
    // Shared filters
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    
    // Retry functions
    retryFeaturedProducts,
    retryRegularProducts,
    
    // Legacy support for backward compatibility
    products,
    loading,
  };
}
