import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const readymadeShops = await prisma.menu.findMany({
      where: {
        isReadymade: true,
      },
      include: {
        items: {
            take: 1 // Just take one item for preview image if needed
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(readymadeShops, { status: 200 });
  } catch (error) {
    console.error("Error fetching readymade shops:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
