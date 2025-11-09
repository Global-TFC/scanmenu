import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = { params: { slug: string } };

// GET /api/menu/[slug]/items - return menu items for a menu
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: {
        id: true,
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ items: menu.items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/menu/[slug]/items - create a new menu item for the menu
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const body = await request.json();
    const { name, description, price, image, categoryId } = body as {
      name: string;
      description?: string;
      price?: number;
      image?: string;
      categoryId?: string;
    };

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const menu = await prisma.menu.findUnique({ where: { slug }, select: { id: true } });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

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
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
