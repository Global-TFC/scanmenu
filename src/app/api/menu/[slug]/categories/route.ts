import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// GET /api/menu/[slug]/categories - list all categories for a menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

// POST /api/menu/[slug]/categories - create a new category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, image } = body as { name: string; image?: string };

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        image: image || null,
        menuId: menu.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
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

// PUT /api/menu/[slug]/categories - update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { id, name, image } = body as { id: string; name?: string; image?: string };

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

// DELETE /api/menu/[slug]/categories - delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
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
