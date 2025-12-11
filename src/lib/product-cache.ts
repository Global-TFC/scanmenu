// Product cache utility for featured and regular products
import { Product } from "@/hooks/use-products";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface FeaturedProductsCache {
  products: Product[];
}

interface RegularProductsCache {
  products: Product[];
  hasMore: boolean;
  page: number;
}

class ProductCache {
  private featuredCache = new Map<string, CacheEntry<FeaturedProductsCache>>();
  private regularCache = new Map<string, CacheEntry<RegularProductsCache>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cache entries

  // Generate cache key for featured products
  private getFeaturedCacheKey(slug: string, search: string, category: string): string {
    return `featured:${slug}:${search}:${category}`;
  }

  // Generate cache key for regular products
  private getRegularCacheKey(slug: string, search: string, category: string, page: number): string {
    return `regular:${slug}:${search}:${category}:${page}`;
  }

  // Check if cache entry is valid (not expired)
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  // Clean up expired entries and maintain cache size
  private cleanup<T>(cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();
    
    // Remove expired entries
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_TTL) {
        cache.delete(key);
      }
    }

    // If still over limit, remove oldest entries
    if (cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }

  // Get featured products from cache
  getFeaturedProducts(slug: string, search: string = "", category: string = "All"): FeaturedProductsCache | null {
    const key = this.getFeaturedCacheKey(slug, search, category);
    const entry = this.featuredCache.get(key);
    
    if (entry && this.isValidEntry(entry)) {
      return entry.data;
    }
    
    return null;
  }

  // Set featured products in cache
  setFeaturedProducts(slug: string, search: string = "", category: string = "All", products: Product[]): void {
    const key = this.getFeaturedCacheKey(slug, search, category);
    
    this.featuredCache.set(key, {
      data: { products },
      timestamp: Date.now(),
      key,
    });

    this.cleanup(this.featuredCache);
  }

  // Get regular products from cache
  getRegularProducts(slug: string, search: string = "", category: string = "All", page: number = 1): RegularProductsCache | null {
    const key = this.getRegularCacheKey(slug, search, category, page);
    const entry = this.regularCache.get(key);
    
    if (entry && this.isValidEntry(entry)) {
      return entry.data;
    }
    
    return null;
  }

  // Set regular products in cache
  setRegularProducts(slug: string, search: string = "", category: string = "All", page: number = 1, products: Product[], hasMore: boolean): void {
    const key = this.getRegularCacheKey(slug, search, category, page);
    
    this.regularCache.set(key, {
      data: { products, hasMore, page },
      timestamp: Date.now(),
      key,
    });

    this.cleanup(this.regularCache);
  }

  // Get cached regular products for multiple pages (for infinite scroll)
  getCachedRegularProductsUpToPage(slug: string, search: string = "", category: string = "All", maxPage: number): { products: Product[]; hasMore: boolean; lastCachedPage: number } | null {
    const allProducts: Product[] = [];
    let hasMore = true;
    let lastCachedPage = 0;

    for (let page = 1; page <= maxPage; page++) {
      const cached = this.getRegularProducts(slug, search, category, page);
      if (!cached) {
        break;
      }
      
      allProducts.push(...cached.products);
      hasMore = cached.hasMore;
      lastCachedPage = page;
    }

    return lastCachedPage > 0 ? { products: allProducts, hasMore, lastCachedPage } : null;
  }

  // Invalidate featured products cache
  invalidateFeaturedProducts(slug?: string): void {
    if (slug) {
      // Invalidate specific slug
      for (const key of this.featuredCache.keys()) {
        if (key.includes(`featured:${slug}:`)) {
          this.featuredCache.delete(key);
        }
      }
    } else {
      // Invalidate all featured products
      this.featuredCache.clear();
    }
  }

  // Invalidate regular products cache
  invalidateRegularProducts(slug?: string): void {
    if (slug) {
      // Invalidate specific slug
      for (const key of this.regularCache.keys()) {
        if (key.includes(`regular:${slug}:`)) {
          this.regularCache.delete(key);
        }
      }
    } else {
      // Invalidate all regular products
      this.regularCache.clear();
    }
  }

  // Invalidate all caches
  invalidateAll(): void {
    this.featuredCache.clear();
    this.regularCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      featuredCacheSize: this.featuredCache.size,
      regularCacheSize: this.regularCache.size,
      totalCacheSize: this.featuredCache.size + this.regularCache.size,
    };
  }
}

// Export singleton instance
export const productCache = new ProductCache();