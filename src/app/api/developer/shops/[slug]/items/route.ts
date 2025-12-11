import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asayn.com@gmail.com';

async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return false;
  }
  return true;
}

// GET /api/developer/shops/[slug]/items
export async function GET(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = request.url;
  const splitUrl = url.split("/");
  // .../api/developer/shops/[slug]/items
  const slug = splitUrl[splitUrl.length - 2];

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
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

// POST /api/developer/shops/[slug]/items
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = request.url;
  const splitUrl = url.split("/");
  const slug = splitUrl[splitUrl.length - 2];

  try {
    const body = await request.json();
    const { name, category, price, offerPrice, image } = body;

    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

    // Handle Category - create if doesn't exist
    let categoryId: string | undefined;
    if (category) {
      const cat = await prisma.category.upsert({
        where: {
          menuId_name: {
            menuId: menu.id,
            name: category,
          },
        },
        update: {},
        create: {
          name: category,
          menuId: menu.id,
        },
      });
      categoryId = cat.id;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        name,
        category: category || null,
        categoryId: categoryId,
        price: price ?? null,
        offerPrice: offerPrice ?? null,
        image: image || null,
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

// PUT /api/developer/shops/[slug]/items
export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = request.url;
  const splitUrl = url.split("/");
  const slug = splitUrl[splitUrl.length - 2];

  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      price,
      offerPrice,
      image,
      isFeatured,
      isAvailable,
    } = body;

    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

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
    
    // Handle Category Update - create if doesn't exist
    if (category !== undefined) {
      data.category = category || null;
      if (category) {
        try {
          const cat = await prisma.category.upsert({
            where: {
              menuId_name: {
                menuId: menu.id,
                name: category,
              },
            },
            update: {},
            create: {
              name: category,
              menuId: menu.id,
            },
          });
          data.categoryId = cat.id;
        } catch (e) {
          console.error("Error upserting category during PUT:", e);
        }
      } else {
        data.categoryId = null;
      }
    }
    
    if (price !== undefined) data.price = price ?? null;
    if (offerPrice !== undefined) data.offerPrice = offerPrice ?? null;
    if (image !== undefined) data.image = image || null;
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

// DELETE /api/developer/shops/[slug]/items
export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = request.url;
  const splitUrl = url.split("/");
  const slug = splitUrl[splitUrl.length - 2];

  try {
    const body = await request.json();
    const { id } = body;

    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      select: { id: true, menuId: true },
    });
    if (!existingItem) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
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
