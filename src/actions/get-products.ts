"use server";

import prisma from "@/lib/prisma";

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
