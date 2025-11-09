// app/api/menus/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MenuTemplateType } from '@/generated/prisma/enums';

type RouteContext = {
  params: { slug: string };
};

// GET /api/menus/[slug] - Fetch menu by slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    let { slug } = params;

    // Fallback: try to extract slug from the request URL path if params.slug is undefined
    if (!slug) {
      try {
        const urlObj = new URL(request.url);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        // Expecting path like /api/menu/:slug -> last segment should be slug
        const last = parts[parts.length - 1];
        const extracted = last === 'menu' ? '' : decodeURIComponent(last || '');
        if (extracted) slug = extracted;
      } catch {
        // ignore
      }
    }

    // Debugging: if slug is still missing, return a clear error and log request details
    if (!slug) {
      console.error('Missing slug in route params or URL', { url: request.url, params });
      return NextResponse.json(
        { error: 'Missing slug parameter', url: request.url, params },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        // include items as-is and sort in code to avoid nested orderBy inside include
        items: true,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/menus/[slug] - Update menu by slug
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { title, summary, template } = body as {
      title?: string;
      summary?: string;
      template?: MenuTemplateType;
    };

    // Check if menu exists
    const existingMenu = await prisma.menu.findUnique({
      where: { slug },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const updatedMenu = await prisma.menu.update({
      where: { slug },
      data: {
        ...(title && { title }),
        ...(summary !== undefined && { summary }),
        ...(template && { template }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return NextResponse.json(updatedMenu, { status: 200 });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[slug] - Delete menu by slug
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;

    // Check if menu exists
    const existingMenu = await prisma.menu.findUnique({
      where: { slug },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    await prisma.menu.delete({
      where: { slug },
    });

    return NextResponse.json(
      { message: 'Menu deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}
