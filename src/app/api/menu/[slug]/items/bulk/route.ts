import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface BulkItem {
  name: string;
  price: number;
  category?: string;
  image?: string;
  offerPrice?: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid items data" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      include: { items: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const existingItemsMap = new Map(
      menu.items.map((item) => [item.name.toLowerCase(), item])
    );

    // Pre-fetch all categories for this menu
    const existingCategories = await prisma.category.findMany({
      where: { menuId: menu.id },
    });
    const categoryMap = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c.id]));

    // Find new categories to create
    const newCategoryNames = new Set<string>();
    items.forEach((item: any) => {
      const catName = (item.category || "Uncategorized").trim();
      if (!categoryMap.has(catName.toLowerCase())) {
        newCategoryNames.add(catName);
      }
    });

    // Create new categories first (separate transaction or just awaiting loop)
    // For simplicity and avoiding massive transaction complexity, let's create them first.
    // In a real bulk scenario, we might want this atomic, but let's do best effort.
    for (const catName of Array.from(newCategoryNames)) {
      try {
        const newCat = await prisma.category.create({
          data: { name: catName, menuId: menu.id },
        });
        categoryMap.set(catName.toLowerCase(), newCat.id);
      } catch (e) {
        // Likely race condition or already exists, try fetching
        // Silent fail is "okay" as we'll just fall back to no-link or fetch again?
        // Let's safe-guard:
        const existing = await prisma.category.findUnique({
             where: { menuId_name: { menuId: menu.id, name: catName } }
        });
        if (existing) categoryMap.set(catName.toLowerCase(), existing.id);
      }
    }

    const operations = [];

    for (const item of items as BulkItem[]) {
      const normalizedName = item.name.trim();
      const lowerName = normalizedName.toLowerCase();
      const existingItem = existingItemsMap.get(lowerName);

      const catName = (item.category || "Uncategorized").trim();
      const categoryId = categoryMap.get(catName.toLowerCase());

      if (existingItem) {
        // Update if price is different
        if (existingItem.price !== item.price) {
          operations.push(
            prisma.menuItem.update({
              where: { id: existingItem.id },
              data: { 
                price: item.price,
                // Optionally update category too? 
                // Logic usually: if name matches, we might just be updating price.
                // But if they provided a category in the bulk file, maybe update it?
                // Let's assume bulk upload is authoritative.
                category: catName,
                categoryId: categoryId
              },
            })
          );
        }
      } else {
        // Create new item
        operations.push(
          prisma.menuItem.create({
            data: {
              menuId: menu.id,
              name: normalizedName,
              price: item.price,
              category: catName,
              categoryId: categoryId,
              image: item.image || "",
              offerPrice: item.offerPrice,
            },
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({
      message: `Processed ${items.length} items. Updated/Created ${operations.length} items.`,
      updatedCount: operations.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}
