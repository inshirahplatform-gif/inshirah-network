import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { PayoutRequest, Promoter } from "@/models";

/**
 * Shared admin auth guard.
 * Returns the verified session on success, or a ready-to-send error Response.
 */
async function requireAdmin(): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "অনুগ্রহ করে লগ-ইন করুন" },
        { status: 401 }
      ),
    };
  }

  const session = await verifySession(sessionCookie.value);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "শুধুমাত্র অ্যাডমিন এই কাজ করতে পারবেন।" },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}

// GET: Fetch all payout requests with promoter details
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();

    const payoutRequests = await PayoutRequest.find()
      .populate("promoterId", "fullName email whatsapp")
      .sort({ requestedAt: -1 })
      .lean();

    return NextResponse.json({ payoutRequests }, { status: 200 });
  } catch (error) {
    console.error("Fetch payout requests error:", error);
    return NextResponse.json(
      { error: "পে-আউট রিকোয়েস্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// PATCH: Approve or reject a payout request
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    await dbConnect();

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "requestId এবং action প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    if (!["Approve", "Reject"].includes(action)) {
      return NextResponse.json(
        { error: "action হতে হবে 'Approve' বা 'Reject'" },
        { status: 400 }
      );
    }

    const payoutRequest = await PayoutRequest.findById(requestId);
    if (!payoutRequest) {
      return NextResponse.json(
        { error: "পে-আউট রিকোয়েস্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    if (payoutRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "এই পে-আউট রিকোয়েস্টটি ইতিমধ্যে প্রক্রিয়া করা হয়েছে।" },
        { status: 400 }
      );
    }

    if (action === "Approve") {
      payoutRequest.status = "Approved";
      await payoutRequest.save();

      return NextResponse.json(
        {
          message: "পে-আউট সফলভাবে অনুমোদন করা হয়েছে।",
          payoutRequest,
        },
        { status: 200 }
      );
    }

    // action === "Reject": refund the amount back to promoter's availableBalance
    payoutRequest.status = "Rejected";
    await payoutRequest.save();

    const promoter = await Promoter.findById(payoutRequest.promoterId);
    if (promoter) {
      promoter.availableBalance += payoutRequest.amount;
      await promoter.save();
    }

    return NextResponse.json(
      {
        message:
          "পে-আউট রিকোয়েস্টটি বাতিল করা হয়েছে এবং ব্যালেন্স প্রমোটারকে ফেরত দেওয়া হয়েছে।",
        payoutRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payout action error:", error);
    return NextResponse.json(
      { error: "পে-আউট অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
