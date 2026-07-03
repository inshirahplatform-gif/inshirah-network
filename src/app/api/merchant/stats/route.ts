import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Product, Order } from "@/models";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore   = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    if (session.role !== "merchant") {
      return NextResponse.json({ error: "অ্যাক্সেস নিষিদ্ধ" }, { status: 403 });
    }

    await dbConnect();
    const merchantId = session.userId;

    const [activeListings, deliveredOrders, pendingOrders, recentOrders] =
      await Promise.all([
        Product.countDocuments({ merchantId, status: "active" }),
        Order.find({ merchantId, status: "Delivered" })
          .select("totalAmount commissionAmount")
          .lean(),
        // Full pending order objects for the courier booking table
        Order.find({ merchantId, status: { $in: ["Pending", "Shipped"] } })
          .sort({ createdAt: -1 })
          .select(
            "customerName customerPhone shippingAddress totalAmount status " +
            "courierTrackingId courierStatus pickupName pickupPhone pickupAddress createdAt"
          )
          .lean(),
        Order.find({ merchantId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("customerName totalAmount status createdAt courierTrackingId courierStatus")
          .lean(),
      ]);

    const totalRevenue        = deliveredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCommissionsPaid = deliveredOrders.reduce((s, o) => s + o.commissionAmount, 0);
    const netRevenue          = totalRevenue - totalCommissionsPaid;

    return NextResponse.json(
      {
        stats: {
          activeListings,
          pendingOrders: pendingOrders.length,
          totalDelivered: deliveredOrders.length,
          totalRevenue,
          netRevenue,
        },
        pendingOrders,   // full objects used by the courier booking table
        recentOrders,    // last 5 for the mini-summary strip
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
