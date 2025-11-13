import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// GET /api/menu/[slug]/items - return menu items for a menu
export async function GET(request: NextRequest) {
  try {
    const url = request.url;
    const splitUrl = url.split("/");
    const slug = splitUrl[splitUrl.length - 2];

    console.log("slug:", slug);
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: {
        id: true,
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ items: menu.items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch menu items",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/menu/[slug]/items - create a new menu item for the menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, description, price, image, categoryId } = body as {
      slug: string;
      name: string;
      description?: string;
      price?: number;
      image?: string;
      categoryId?: string;
    };

    if (!slug)
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!menu)
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });

    const newItem = await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        name,
        description: description || null,
        price: price ?? null,
        image: image || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      {
        error: "Failed to create menu item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      id,
      name,
      description,
      price,
      image,
      categoryId,
      isFeatured,
      isAvailable,
    } = body as {
      slug: string;
      id: string;
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      categoryId?: string;
      isFeatured?: boolean;
      isAvailable?: boolean;
    };

    if (!slug)
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });
    if (!menu)
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    if (menu.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      select: { id: true, menuId: true },
    });
    if (!existingItem)
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    if (existingItem.menuId !== menu.id)
      return NextResponse.json({ error: "Item does not belong to menu" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (price !== undefined) data.price = price ?? null;
    if (image !== undefined) data.image = image || null;
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;
    if (isAvailable !== undefined) data.isAvailable = !!isAvailable;

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update menu item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, id } = body as { slug: string; id: string };

    if (!slug)
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });
    if (!menu)
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    if (menu.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      select: { id: true, menuId: true },
    });
    if (!existingItem)
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    if (existingItem.menuId !== menu.id)
      return NextResponse.json({ error: "Item does not belong to menu" }, { status: 400 });

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete menu item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
