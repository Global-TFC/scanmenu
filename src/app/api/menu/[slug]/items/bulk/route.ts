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

    const operations = [];

    for (const item of items as BulkItem[]) {
      const normalizedName = item.name.trim();
      const lowerName = normalizedName.toLowerCase();
      const existingItem = existingItemsMap.get(lowerName);

      if (existingItem) {
        // Update if price is different
        if (existingItem.price !== item.price) {
          operations.push(
            prisma.menuItem.update({
              where: { id: existingItem.id },
              data: { price: item.price },
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
              category: item.category || "Uncategorized",
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
