import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Order, Promoter, Merchant } from "@/models";

const PROMOTER_SHARE = 0.8;
const ESCROW_DAYS    = 7;

// ── Auth helper ───────────────────────────────────────────────────────────────
async function requireMerchant() {
  const cookieStore  = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return null;

  const session = await verifySession(sessionCookie.value);
  if (!session || session.role !== "merchant") return null;
  return session;
}

// ── GET: list merchant's orders ───────────────────────────────────────────────
export async function GET(_request: NextRequest) {
  const session = await requireMerchant();
  if (!session) {
    return NextResponse.json(
      { error: "অনুগ্রহ করে মার্চেন্ট হিসেবে লগ-ইন করুন" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const orders = await Order.find({ merchantId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select(
        "customerName customerPhone shippingAddress totalAmount commissionAmount " +
        "status commissionStatus escrowReleaseDate " +
        "courierTrackingId courierStatus " +
        "pickupName pickupPhone pickupAddress createdAt"
      )
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "অর্ডার তালিকা লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// ── PATCH: update order status ───────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const session = await requireMerchant();
  if (!session) {
    return NextResponse.json(
      { error: "অনুগ্রহ করে মার্চেন্ট হিসেবে লগ-ইন করুন" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const body = await request.json() as {
      orderId?: string;
      status?: string;
    };
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId এবং status প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "অবৈধ স্ট্যাটাস" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }
    if (order.merchantId.toString() !== session.userId) {
      return NextResponse.json({ error: "এই অর্ডারটি আপনার নয়।" }, { status: 403 });
    }

    // Handle status transitions
    if (status === "Delivered") {
      if (order.status === "Delivered" || order.status === "Cancelled") {
        return NextResponse.json(
          { error: "এই অর্ডারের স্ট্যাটাস ইতিমধ্যে আপডেট করা হয়েছে।" },
          { status: 400 }
        );
      }

      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + ESCROW_DAYS);

      const totalCommission = order.commissionAmount ?? 0;
      const promoterShare = totalCommission * PROMOTER_SHARE;
      const merchantNet = order.totalAmount - totalCommission;

      if (order.promoterId && totalCommission > 0) {
        const promoter = await Promoter.findById(order.promoterId);
        if (promoter) {
          promoter.pendingBalance = Math.max(0, promoter.pendingBalance - totalCommission);
          promoter.holdBalance += promoterShare;
          await promoter.save();
        }
      }

      const merchant = await Merchant.findById(session.userId);
      if (merchant && merchantNet > 0) {
        merchant.withdrawableBalance += merchantNet;
        await merchant.save();
      }

      order.status = "Delivered";
      order.commissionStatus = totalCommission > 0 && order.promoterId ? "held" : "none";
      order.escrowReleaseDate = releaseDate;
    } else {
      // Simple status update for other transitions
      order.status = status as any;
    }

    await order.save();

    return NextResponse.json(
      {
        message: "অর্ডার স্ট্যাটাস আপডেট করা হয়েছে",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "অর্ডার আপডেটে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
