import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Promoter, Merchant, Product, Order, PayoutRequest } from "@/models";

export async function GET(_request: NextRequest) {
  try {
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

    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "শুধুমাত্র অ্যাডমিন এই তথ্য দেখতে পারবেন।" },
        { status: 403 }
      );
    }

    await dbConnect();

    const [
      totalPromoters,
      totalMerchants,
      totalProducts,
      totalOrders,
      pendingPayouts,
      deliveredOrders,
    ] = await Promise.all([
      Promoter.countDocuments(),
      Merchant.countDocuments(),
      Product.countDocuments({ status: "active" }),
      Order.countDocuments(),
      PayoutRequest.find({ status: "Pending" })
        .populate("promoterId", "fullName email whatsapp")
        .sort({ requestedAt: -1 })
        .lean(),
      Order.find({ status: "Delivered" })
        .select("totalAmount commissionAmount")
        .lean(),
    ]);

    const totalPlatformRevenue = deliveredOrders.reduce(
      (sum, o) => sum + o.commissionAmount * 0.2,
      0
    );

    return NextResponse.json(
      {
        stats: {
          totalPromoters,
          totalMerchants,
          totalProducts,
          totalOrders,
          pendingPayoutsCount: pendingPayouts.length,
          totalPlatformRevenue,
        },
        pendingPayouts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "পরিসংখ্যান লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
