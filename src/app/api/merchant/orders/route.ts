import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Order, Promoter } from "@/models";

// Platform fee percentage — the remaining share goes to the promoter
const PLATFORM_FEE_PERCENTAGE = 0.2; // 20%
const PROMOTER_SHARE_PERCENTAGE = 1 - PLATFORM_FEE_PERCENTAGE; // 80%

export async function PATCH(request: NextRequest) {
  try {
    // Only verified merchants can mark their own orders as delivered
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে লগ-ইন করুন" },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    if (session.role !== "merchant") {
      return NextResponse.json(
        { error: "শুধুমাত্র মার্চেন্ট অর্ডার ডেলিভার্ড মার্ক করতে পারবেন।" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId এবং status প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    if (status !== "Delivered") {
      return NextResponse.json(
        { error: "status হতে হবে 'Delivered'" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Ensure only the merchant who owns this order can update it
    if (order.merchantId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "এই অর্ডারটি আপনার নয়।" },
        { status: 403 }
      );
    }

    // Guard against double-processing
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return NextResponse.json(
        { error: "এই অর্ডারের স্ট্যাটাস ইতিমধ্যে আপডেট করা হয়েছে।" },
        { status: 400 }
      );
    }

    // 80/20 profit-split on delivery
    if (order.promoterId && order.commissionAmount > 0) {
      const totalCommission = order.commissionAmount;
      const promoterShare = totalCommission * PROMOTER_SHARE_PERCENTAGE; // 80%

      const promoter = await Promoter.findById(order.promoterId);
      if (promoter) {
        // Remove the full commission from pending (was reserved at order creation)
        promoter.pendingBalance -= totalCommission;

        // Credit the promoter's actual 80% share to available and lifetime total
        promoter.availableBalance += promoterShare;
        promoter.totalEarned += promoterShare;

        await promoter.save();
      }
    }

    // Mark order as delivered
    order.status = "Delivered";
    await order.save();

    return NextResponse.json(
      {
        message:
          "আলহামদুলিল্লাহ, অর্ডারটি সফলভাবে ডেলিভার্ড মার্ক করা হয়েছে এবং প্রমোটার কমিশন স্বয়ংক্রিয়ভাবে ভাগ হয়ে ওয়ালেটে জমা হয়েছে।",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "অর্ডার স্ট্যাটাস আপডেটে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
