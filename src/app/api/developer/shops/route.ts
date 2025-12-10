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

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shops = await prisma.menu.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
            select: { email: true, name: true }
        },
        _count: {
          select: { items: true }
        }
      }
    });
    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
   if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const menu = await prisma.menu.findUnique({ 
      where: { slug }, 
      select: { id: true, isReadymade: true, userId: true } 
    });
    
    if (!menu) {
         // Already gone? return success
         return NextResponse.json({ success: true });
    }

    // Delete items first since Cascade is not enabled in schema for MenuItem
    await prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({ where: { menuId: menu.id } });
      await tx.menu.delete({ where: { slug } });
      
      // If it's a readymade shop, clean up the dummy user
      if (menu.isReadymade) {
        try {
          await tx.user.delete({ where: { id: menu.userId } });
        } catch (e) {
          console.error("Failed to delete dummy user for readymade shop", e);
          // Don't fail the request if user deletion fails, though it leaves an orphan
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
     console.error("Error deleting shop:", error);
     return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 });
  }
}
