"use server";

import prisma from "@/lib/prisma";
import { withRetry, withTimeout } from "@/lib/retry-utils";

const PAGE_SIZE = 10;

export interface GetProductsParams {
  slug: string;
  page?: number;
  search?: string;
  category?: string;
}

export interface ProductResult {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  isFeatured?: boolean;
}

// New interfaces for separate product fetching
export interface GetFeaturedProductsParams {
  slug: string;
  search?: string;
  category?: string;
}

export interface FeaturedProductsResult {
  products: ProductResult[];
}

export interface GetRegularProductsParams {
  slug: string;
  page?: number;
  search?: string;
  category?: string;
}

export interface RegularProductsResult {
  products: ProductResult[];
  hasMore: boolean;
}

// Helper function to build common where clause
function buildBaseWhereClause(slug: string, search?: string, category?: string) {
  const where: any = {
    menu: {
      slug: slug,
    },
    isAvailable: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category && category !== "All") {
    where.category = category;
  }

  return where;
}

// Helper function to transform database items to ProductResult
function transformToProductResult(items: any[]): ProductResult[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.categoryItem?.name || item.category || "General",
    description: item.categoryItem?.name || item.category || "General",
    price: item.price || 0,
    offerPrice: item.offerPrice || undefined,
    image: item.image || "/default-product.png",
    isFeatured: item.isFeatured,
  }));
}

// Fetch only featured products (no pagination)
export async function getFeaturedProducts({
  slug,
  search = "",
  category = "All",
}: GetFeaturedProductsParams): Promise<FeaturedProductsResult> {
  return withRetry(async () => {
    try {
      const where = buildBaseWhereClause(slug, search, category);
      
      // Add featured products filter
      where.isFeatured = true;

      const items = await withTimeout(
        prisma.menuItem.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            category: true,
            categoryItem: {
              select: {
                name: true,
              }
            },
            price: true,
            offerPrice: true,
            image: true,
            isFeatured: true,
          },
        }),
        10000 // 10 second timeout
      );

      // Validate and filter out malformed products
      const validItems = items.filter(item => {
        return item.id && item.name && typeof item.price === 'number';
      });

      const products = transformToProductResult(validItems);

      return { products };
    } catch (error) {
      console.error("Error fetching featured products:", error);
      
      // Enhance error with more context
      const enhancedError = new Error(
        `Failed to fetch featured products for slug: ${slug}. ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      enhancedError.cause = error;
      throw enhancedError;
    }
  }, {
    maxAttempts: 3,
    shouldRetry: (error) => {
      // Don't retry on validation errors or missing slug
      if (!slug || error?.message?.includes('validation')) return false;
      return true;
    }
  });
}

// Fetch regular products (with pagination)
export async function getRegularProducts({
  slug,
  page = 1,
  search = "",
  category = "All",
}: GetRegularProductsParams): Promise<RegularProductsResult> {
  return withRetry(async () => {
    try {
      // Validate inputs
      if (!slug) {
        throw new Error("Slug is required");
      }
      if (page < 1) {
        throw new Error("Page must be greater than 0");
      }

      const skip = (page - 1) * PAGE_SIZE;
      const baseWhere = buildBaseWhereClause(slug, search, category);
      
      // Build the where clause for regular products (not featured)
      const where: any = {
        ...baseWhere,
        AND: [
          // Keep the base conditions
          ...(baseWhere.AND || []),
          // Add the "not featured" condition
          {
            isFeatured: false
          }
        ]
      };
      
      // If there were OR conditions from base where, we need to handle them properly
      if (baseWhere.OR) {
        // Move the OR conditions into the AND array
        where.AND.push({ OR: baseWhere.OR });
        delete where.OR;
      }

      const items = await withTimeout(
        prisma.menuItem.findMany({
          where,
          skip,
          take: PAGE_SIZE,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            category: true,
            categoryItem: {
              select: {
                name: true,
              }
            },
            price: true,
            offerPrice: true,
            image: true,
            isFeatured: true,
          },
        }),
        15000 // 15 second timeout for paginated queries
      );

      // Validate and filter out malformed products
      const validItems = items.filter(item => {
        return item.id && item.name && typeof item.price === 'number';
      });

      const hasMore = validItems.length === PAGE_SIZE;
      const products = transformToProductResult(validItems);

      return { products, hasMore };
    } catch (error) {
      console.error("Error fetching regular products:", error);
      
      // Enhance error with more context
      const enhancedError = new Error(
        `Failed to fetch regular products for slug: ${slug}, page: ${page}. ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      enhancedError.cause = error;
      throw enhancedError;
    }
  }, {
    maxAttempts: 3,
    shouldRetry: (error) => {
      // Don't retry on validation errors
      if (error?.message?.includes('validation') || error?.message?.includes('required')) return false;
      return true;
    }
  });
}

// Keep original function for backward compatibility
export async function getProducts({
  slug,
  page = 1,
  search = "",
  category = "All",
}: GetProductsParams) {
  try {
    const skip = (page - 1) * PAGE_SIZE;

    const where: any = {
      menu: {
        slug: slug,
      },
      isAvailable: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } }, // Often description defaults to category in existing code, but checking category match is good too
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    const items = await prisma.menuItem.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        category: true,
        categoryItem: {
          select: {
            name: true,
          }
        },
        price: true,
        offerPrice: true,
        image: true,
        isFeatured: true,
      },
    });

    // We can also return a 'hasMore' flag by checking if we got a full page
    // or by doing a count. Doing a count is cleaner but extra query key.
    // Optimization: fetch PAGE_SIZE + 1.
    
    // Let's stick to simplest:
    const hasMore = items.length === PAGE_SIZE;

    // Transform to Product interface expected by frontend
    const products: ProductResult[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.categoryItem?.name || item.category || "General",
      description: item.categoryItem?.name || item.category || "General", // Existing frontend logic often uses category as description fallback
      price: item.price || 0,
      offerPrice: item.offerPrice || undefined,
      image: item.image || "/default-product.png",
      isFeatured: item.isFeatured,
    }));

    return { products, hasMore };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], hasMore: false };
  }
}
