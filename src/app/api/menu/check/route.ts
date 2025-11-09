import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { userId },
    });

    // If no menu exists, return 404
    if (!menu) {
      return NextResponse.json(
        { exists: false },
        { status: 404 }
      );
    }

    // Menu exists, return the menu data
    return NextResponse.json(
      { exists: true, menu },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking menu:", error);
    return NextResponse.json(
      { error: "Failed to check menu" },
      { status: 500 }
    );
  }
}