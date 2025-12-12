import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const DEVELOPER_EMAIL = "asayn.com@gmail.com";

async function checkDeveloperAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email !== DEVELOPER_EMAIL) {
    return null;
  }
  return session;
}

// GET /api/developer/shops/[slug]/categories
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await checkDeveloperAccess();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: {
        id: true,
        categories: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ categories: menu.categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/developer/shops/[slug]/categories
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("[DEV-CATEGORIES] POST request received");
    
    const session = await checkDeveloperAccess();
    if (!session) {
      console.log("[DEV-CATEGORIES] Unauthorized - no valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[DEV-CATEGORIES] Session verified:", session.user.email);

    const { slug } = await params;
    console.log("[DEV-CATEGORIES] Slug:", slug);
    
    const body = await request.json();
    const { name, image } = body as { name: string; image?: string };
    console.log("[DEV-CATEGORIES] Body:", { name, image });

    if (!name) {
      console.log("[DEV-CATEGORIES] Name is required");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!menu) {
      console.log("[DEV-CATEGORIES] Menu not found for slug:", slug);
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }
    console.log("[DEV-CATEGORIES] Menu found:", menu.id);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        image: image || null,
        menuId: menu.id,
      },
    });
    console.log("[DEV-CATEGORIES] Category created:", category);

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("[DEV-CATEGORIES] Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/developer/shops/[slug]/categories
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await checkDeveloperAccess();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { id, name, image } = body as { id: string; name?: string; image?: string };

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { menuId: true },
    });

    if (!existingCategory || existingCategory.menuId !== menu.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (image !== undefined) data.image = image || null;

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    // If the category name was updated, also update all related menu items
    if (name !== undefined) {
      await prisma.menuItem.updateMany({
        where: { categoryId: id },
        data: { category: name.trim() },
      });
    }

    // Invalidate product cache since category data has changed
    const { productCache } = await import("@/lib/product-cache");
    productCache.invalidateAll();

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/developer/shops/[slug]/categories
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await checkDeveloperAccess();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { menuId: true },
    });

    if (!category || category.menuId !== menu.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Unlink products from this category before deleting
    await prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
