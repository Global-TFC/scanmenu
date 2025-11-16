import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { MenuTemplateType } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, slug, title, summary, template } = body as {
      userId: string;
      slug: string;
      title: string;
      summary?: string;
      template?: MenuTemplateType;
    };

    // Validation
    if (!userId || !slug || !title) {
      return NextResponse.json(
        { error: "userId, slug, and title are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingMenu = await prisma.menu.findUnique({
      where: { slug },
    });

    if (existingMenu) {
      return NextResponse.json(
        { error: "Menu with this slug already exists" },
        { status: 409 }
      );
    }

    // Check if user already has a menu
    const userMenu = await prisma.menu.findUnique({
      where: { userId },
    });

    if (userMenu) {
      return NextResponse.json(
        { error: "User already has a menu" },
        { status: 409 }
      );
    }

    const newMenu = await prisma.menu.create({
      data: {
        userId,
        slug,
        title,
        summary: summary || null,
        template: template || MenuTemplateType.PRO,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, summary, template } = body as {
      id: string;
      title?: string;
      summary?: string | null;
      template?: MenuTemplateType;
    };

    if (!id) {
      return NextResponse.json(
        { error: "Menu id is required" },
        { status: 400 }
      );
    }

    const existingMenu = await prisma.menu.findUnique({ where: { id } });
    if (!existingMenu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(template !== undefined && { template }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json(updatedMenu, { status: 200 });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// check menu form already filled
export async function GET(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body as {
      userId: string;
    };

    const menu = await prisma.menu.findUnique({
      where: { userId },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
