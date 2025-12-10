import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { MenuTemplateType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Helper to generate random string
const randomString = (length: number) => Math.random().toString(36).substring(2, length + 2);



export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.email !== "asayn.com@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { shopName, slug, claimCode, template } = body;

    if (!shopName || !slug) {
      return NextResponse.json({ error: "Shop Name and Slug are required" }, { status: 400 });
    }

    // Check if slug exists
    const existingMenu = await prisma.menu.findUnique({ where: { slug } });
    if (existingMenu) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    // Create a dummy user for this shop
    // We need a unique email for the dummy user
    const dummyEmail = `readymade_${slug}_${randomString(5)}@scanmenu.com`;
    
    const dummyUser = await prisma.user.create({
      data: {
        email: dummyEmail,
        name: `${shopName} Owner`,
        emailVerified: true,
      }
    }); 

    // Create the menu
    const newMenu = await prisma.menu.create({
      data: {
        userId: dummyUser.id,
        slug,
        shopName,
        template: template || MenuTemplateType.PRO,
        isReadymade: true,
        claimCode: claimCode || null,
        isWhatsappOrderingEnabled: true,
        items: {
          create: []
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(newMenu, { status: 201 });

  } catch (error: any) {
    console.error("Error creating readymade shop:", error);
    return NextResponse.json({ error: error.message || "Failed to create shop" }, { status: 500 });
  }
}
