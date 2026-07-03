/**
 * POST /api/merchant/orders/book-courier
 *
 * Books a parcel with Steadfast Courier for a specific order.
 * pickup details may be supplied in the request body OR fall back to whatever
 * is already stored on the Order document from a previous interaction.
 *
 * On success:
 *   - Saves courierTrackingId and courierStatus to the Order document.
 *   - Advances order.status from "Pending" → "Shipped".
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { createSteadfastOrder } from "@/lib/steadfast";
import { Order } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const cookieStore   = await cookies();
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
        { error: "শুধুমাত্র মার্চেন্ট কুরিয়ার বুক করতে পারবেন।" },
        { status: 403 }
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await request.json() as {
      orderId?:       string;
      pickupName?:    string;
      pickupPhone?:   string;
      pickupAddress?: string;
      note?:          string;
    };

    const { orderId, pickupName, pickupPhone, pickupAddress, note } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    await dbConnect();

    // ── Fetch & authorise order ────────────────────────────────────────────
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    if (order.merchantId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "এই অর্ডারটি আপনার নয়।" },
        { status: 403 }
      );
    }

    if (order.status === "Cancelled") {
      return NextResponse.json(
        { error: "বাতিল হওয়া অর্ডারে কুরিয়ার বুক করা যাবে না।" },
        { status: 400 }
      );
    }

    if (order.courierTrackingId) {
      return NextResponse.json(
        {
          error:         "এই অর্ডারে ইতিমধ্যে কুরিয়ার বুক করা হয়েছে।",
          trackingCode:  order.courierTrackingId,
          courierStatus: order.courierStatus,
        },
        { status: 409 }
      );
    }

    // ── Resolve pickup details ─────────────────────────────────────────────
    // Body values take precedence; fall back to what is already on the order.
    const resolvedPickupName    = pickupName?.trim()    || order.pickupName;
    const resolvedPickupPhone   = pickupPhone?.trim()   || order.pickupPhone;
    const resolvedPickupAddress = pickupAddress?.trim() || order.pickupAddress;

    if (!resolvedPickupName || !resolvedPickupPhone || !resolvedPickupAddress) {
      return NextResponse.json(
        { error: "পিকআপের নাম, ফোন নম্বর এবং ঠিকানা অবশ্যই দিতে হবে।" },
        { status: 400 }
      );
    }

    // ── Call Steadfast API ─────────────────────────────────────────────────
    const steadfastResponse = await createSteadfastOrder({
      invoice:           order._id.toString(),
      recipient_name:    order.customerName,
      recipient_phone:   order.customerPhone,
      recipient_address: order.shippingAddress,
      cod_amount:        order.totalAmount,
      note:              note?.trim() || "Inshirah Network Order",
      // Dynamic sender/pickup so the rider goes to the correct merchant location
      sender_name:       resolvedPickupName,
      sender_phone:      resolvedPickupPhone,
      sender_address:    resolvedPickupAddress,
    });

    // Steadfast returns status 200 inside the JSON body on success
    if (steadfastResponse.status !== 200) {
      return NextResponse.json(
        { error: `Steadfast API ত্রুটি: ${steadfastResponse.message}` },
        { status: 502 }
      );
    }

    const trackingCode  = steadfastResponse.consignment?.tracking_code   ?? "";
    const courierStatus = steadfastResponse.consignment?.delivery_status ?? "in_review";

    // ── Persist to MongoDB ────────────────────────────────────────────────
    order.courierTrackingId = trackingCode;
    order.courierStatus     = courierStatus;
    order.pickupName        = resolvedPickupName;
    order.pickupPhone       = resolvedPickupPhone;
    order.pickupAddress     = resolvedPickupAddress;

    // Advance order status to Shipped now that courier has accepted the parcel
    if (order.status === "Pending") {
      order.status = "Shipped";
    }

    await order.save();

    return NextResponse.json(
      {
        message:
          "আলহামদুলিল্লাহ, কুরিয়ার সফলভাবে বুক করা হয়েছে! " +
          "নিচের ট্র্যাকিং কোডটি সংরক্ষণ করুন।",
        trackingCode,
        courierStatus,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Courier booking error:", error);

    if (error instanceof Error && error.message.includes("must be set")) {
      return NextResponse.json(
        { error: "কুরিয়ার সার্ভিস কনফিগার করা নেই। অ্যাডমিনকে জানান।" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "কুরিয়ার বুকিংয়ে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
