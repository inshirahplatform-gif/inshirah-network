import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Product, Order } from "@/models";

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

    if (session.role !== "merchant") {
      return NextResponse.json(
        { error: "অ্যাক্সেস নিষিদ্ধ" },
        { status: 403 }
      );
    }

    await dbConnect();

    const merchantId = session.userId;

    // Run all queries in parallel for performance
    const [
      activeListings,
      pendingOrders,
      deliveredOrders,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({ merchantId, status: "active" }),
      Order.countDocuments({ merchantId, status: "Pending" }),
      Order.find({ merchantId, status: "Delivered" })
        .select("totalAmount commissionAmount")
        .lean(),
      Order.find({ merchantId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("customerName totalAmount status createdAt")
        .lean(),
    ]);

    const totalRevenue = deliveredOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const totalCommissionsPaid = deliveredOrders.reduce(
      (sum, o) => sum + o.commissionAmount,
      0
    );
    const netRevenue = totalRevenue - totalCommissionsPaid;

    return NextResponse.json(
      {
        stats: {
          activeListings,
          pendingOrders,
          totalDelivered: deliveredOrders.length,
          totalRevenue,
          netRevenue,
        },
        recentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Merchant stats error:", error);
    return NextResponse.json(
      { error: "পরিসংখ্যান লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
