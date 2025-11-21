import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, slug } = await req.json();

    if (!code || !slug) {
      return NextResponse.json(
        { error: "Missing code or slug" },
        { status: 400 }
      );
    }

    // 1. Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (coupon.isRedeemed) {
      return NextResponse.json(
        { error: "Coupon already redeemed" },
        { status: 400 }
      );
    }

    // 2. Find the user by slug (via Menu)
    const menu = await prisma.menu.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!menu || !menu.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = menu.user;

    // 3. Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + coupon.durationMonths));

    // 4. Update User and Coupon in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          isSubscribed: true,
          subscriptionPlan: coupon.plan,
          subscriptionExpiresAt: expiresAt,
        },
      }),
      prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
