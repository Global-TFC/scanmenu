import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, code } = body;

    if (!slug || !code) {
      return NextResponse.json({ error: "Slug and Code are required" }, { status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { claimCode: true, isReadymade: true }
    });

    if (!menu) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (!menu.isReadymade) {
        return NextResponse.json({ error: "This shop is not available for claiming" }, { status: 400 });
    }

    if (menu.claimCode) {
        if (menu.claimCode !== code) {
            return NextResponse.json({ valid: false, error: "Invalid Claim Code" }, { status: 200 });
        }
    } else {
        // If no specific claim code, check if it's a valid coupon
        const coupon = await prisma.coupon.findUnique({ where: { code } });
        if (!coupon) {
             return NextResponse.json({ valid: false, error: "Invalid Coupon Code" }, { status: 200 });
        }
        if (coupon.isRedeemed) {
             return NextResponse.json({ valid: false, error: "Coupon Already Redeemed" }, { status: 200 });
        }
    }

    return NextResponse.json({ valid: true }, { status: 200 });

  } catch (error) {
    console.error("Error verifying claim code:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
