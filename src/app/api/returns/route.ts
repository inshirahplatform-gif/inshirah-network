import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Order } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, reason, description } = body;

    // Validate required fields
    if (!orderId || !reason || !description) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if order belongs to the user
    if (order.userId && order.userId.toString() !== session.userId) {
      return NextResponse.json({ error: "এই অর্ডারে রিটার্ন রিকোয়েস্ট করার অনুমতি নেই" }, { status: 403 });
    }

    // Check if order is eligible for return
    if (order.status !== "Delivered") {
      return NextResponse.json(
        { error: "শুধুমাত্র ডেলিভারড অর্ডারের জন্য রিটার্ন রিকোয়েস্ট করা যাবে" },
        { status: 400 }
      );
    }

    // Check if return window is still open (7 days)
    const deliveredDate = new Date(order.updatedAt);
    const returnDeadline = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now > returnDeadline) {
      return NextResponse.json(
        { error: "রিটার্ন পলিসির সময়সীমা শেষ হয়ে গেছে (৭ দিন)" },
        { status: 400 }
      );
    }

    // In a real implementation, you would create a Return model and save the request
    // For now, we'll just return success
    // TODO: Create Return model and save return request

    return NextResponse.json(
      {
        message: "রিটার্ন রিকোয়েস্ট গ্রহণ করা হয়েছে। শীঘ্রই যোগাযোগ করা হবে।",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { error: "রিটার্ন রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
