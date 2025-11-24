import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, code } = body;

    if (!slug || !code) {
      return NextResponse.json({ error: "Slug and Code are required" }, { status: 400 });
    }

    // 1. Verify Shop and Code again
    const menu = await prisma.menu.findUnique({
      where: { slug },
    });

    if (!menu) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (!menu.isReadymade) {
        return NextResponse.json({ error: "This shop is not available for claiming" }, { status: 400 });
    }

    if (menu.claimCode) {
        if (menu.claimCode !== code) {
            return NextResponse.json({ error: "Invalid Claim Code" }, { status: 403 });
        }
    } else {
        // If no claim code is set on the menu, we check if the provided code is a valid coupon
        // We will do this check later in step 4, but we need to ensure we don't fail here.
        // However, we should probably check if it's a valid coupon HERE to fail early if it's garbage.
        const coupon = await prisma.coupon.findUnique({ where: { code } });
        if (!coupon || coupon.isRedeemed) {
             return NextResponse.json({ error: "Invalid or Redeemed Coupon Code" }, { status: 403 });
        }
    }

    // 2. Check if user already has a menu
    const existingUserMenu = await prisma.menu.findUnique({
        where: { userId: session.user.id }
    });

    if (existingUserMenu) {
        return NextResponse.json({ error: "You already have a shop. You cannot claim another one." }, { status: 409 });
    }

    // 3. Transfer Ownership
    const dummyUserId = menu.userId;

    // Update Menu: assign to new user, remove readymade flag, clear claim code
    const updatedMenu = await prisma.menu.update({
      where: { id: menu.id },
      data: {
        userId: session.user.id,
        isReadymade: false,
        claimCode: null,
      }
    });

    // 4. Check and Redeem Coupon
    let couponRedeemed = false;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code },
    });

    if (coupon && !coupon.isRedeemed) {
      try {
        const now = new Date();
        const expiresAt = new Date(now.setMonth(now.getMonth() + coupon.durationMonths));

        await prisma.$transaction([
          prisma.user.update({
            where: { id: session.user.id },
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
              userId: session.user.id,
            },
          }),
        ]);
        couponRedeemed = true;
      } catch (e) {
        console.error("Failed to redeem coupon during claim", e);
        // We don't fail the claim if coupon fails, but we log it.
      }
    }

    // 5. Delete Dummy User (Cleanup)
    try {
        await prisma.user.delete({
            where: { id: dummyUserId }
        });
    } catch (e) {
        console.warn("Failed to delete dummy user", e);
    }

    return NextResponse.json({ success: true, slug: updatedMenu.slug, couponRedeemed }, { status: 200 });

  } catch (error) {
    console.error("Error claiming shop:", error);
    return NextResponse.json({ error: "Failed to claim shop" }, { status: 500 });
  }
}
