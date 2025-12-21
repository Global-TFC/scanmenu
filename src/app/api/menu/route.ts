import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { MenuTemplateType } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, slug, shopName, shopLogo, place, contactNumber, template, isWhatsappOrderingEnabled } = body as {
      userId: string;
      slug: string;
      shopName: string;
      shopLogo?: string;
      place?: string;
      contactNumber?: string;
      template?: MenuTemplateType;
      isWhatsappOrderingEnabled?: boolean;
    };

    // Validation
    if (!userId || !slug || !shopName) {
      return NextResponse.json(
        { error: "userId, slug, and shopName are required" },
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
        shopName,
        shopLogo: shopLogo || null,
        place: place || null,
        contactNumber: contactNumber || null,
        template: template || MenuTemplateType.PRO,
        isWhatsappOrderingEnabled: isWhatsappOrderingEnabled ?? true,
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
    const { id, shopName, shopLogo, place, contactNumber, locationUrl, template, slug, isWhatsappOrderingEnabled, themeConfig } = body as {
      id: string;
      shopName?: string;
      shopLogo?: string | null;
      place?: string | null;
      contactNumber?: string | null;
      locationUrl?: string | null;
      template?: MenuTemplateType;
      slug?: string;
      isWhatsappOrderingEnabled?: boolean;
      themeConfig?: any;
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

    // If slug is being updated, check uniqueness
    if (slug && slug !== existingMenu.slug) {
      const slugExists = await prisma.menu.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: "Menu with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        ...(shopName !== undefined && { shopName }),
        ...(shopLogo !== undefined && { shopLogo }),
        ...(place !== undefined && { place }),
        ...(contactNumber !== undefined && { contactNumber }),
        ...(locationUrl !== undefined && { locationUrl }),
        ...(template !== undefined && { template }),
        ...(slug !== undefined && { slug }),
        ...(isWhatsappOrderingEnabled !== undefined && { isWhatsappOrderingEnabled }),
        ...(themeConfig !== undefined && { themeConfig }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    // Revalidate the shop page cache
    if (updatedMenu.slug) {
      revalidatePath(`/${updatedMenu.slug}`);
    }

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
