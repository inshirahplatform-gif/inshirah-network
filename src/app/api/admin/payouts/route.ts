import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PayoutRequest, Promoter } from "@/models";

// GET: Fetch all payout requests with promoter details
export async function GET(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Fetch all payout requests with promoter details populated
    const payoutRequests = await PayoutRequest.find()
      .populate("promoterId", "fullName email whatsapp")
      .sort({ requestedAt: -1 })
      .lean();

    return NextResponse.json(
      { payoutRequests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch payout requests error:", error);
    return NextResponse.json(
      { error: "পে-আউট রিকোয়েস্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

// PATCH: Approve or reject a payout request
export async function PATCH(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const { requestId, action } = body;

    // Validate required fields
    if (!requestId || !action) {
      return NextResponse.json(
        { error: "requestId এবং action প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    // Validate action
    if (!["Approve", "Reject"].includes(action)) {
      return NextResponse.json(
        { error: "action হতে হবে 'Approve' বা 'Reject'" },
        { status: 400 }
      );
    }

    // Find the payout request
    const payoutRequest = await PayoutRequest.findById(requestId);
    if (!payoutRequest) {
      return NextResponse.json(
        { error: "পে-আউট রিকোয়েস্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Handle Approve action
    if (action === "Approve") {
      payoutRequest.status = "Approved";
      await payoutRequest.save();

      return NextResponse.json(
        {
          message: "পে-আউট সফলভাবে অনুমোদন করা হয়েছে।",
          payoutRequest,
        },
        { status: 200 }
      );
    }

    // Handle Reject action with refund logic
    if (action === "Reject") {
      payoutRequest.status = "Rejected";
      await payoutRequest.save();

      // Find the promoter and refund the amount
      const promoter = await Promoter.findById(payoutRequest.promoterId);
      if (promoter) {
        promoter.availableBalance += payoutRequest.amount;
        await promoter.save();
      }

      return NextResponse.json(
        {
          message: "পে-আউট রিকোয়েস্টটি বাতিল করা হয়েছে এবং ব্যালেন্স প্রমোটারকে ফেরত দেওয়া হয়েছে।",
          payoutRequest,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "অবৈধ action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payout action error:", error);
    return NextResponse.json(
      { error: "পে-আউট অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
