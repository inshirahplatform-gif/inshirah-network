import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PayoutRequest, Promoter } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const { promoterId, amount, paymentMethod, accountDetails } = body;

    // Validate required fields
    if (!promoterId || !amount || !paymentMethod || !accountDetails) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Validation 1: Check minimum withdrawal amount (500)
    if (typeof amount !== "number" || amount < 500) {
      return NextResponse.json(
        {
          error: "দুঃখিত, ন্যূনতম ৫০০ টাকা না হলে উত্তোলন রিকোয়েস্ট পাঠানো সম্ভব নয়।",
        },
        { status: 400 }
      );
    }

    // Validation 2: Check if payment method is valid
    if (
      !["bKash", "Nagad", "Bank"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "সঠিক পেমেন্ট মেথড নির্বাচন করুন (bKash, Nagad, Bank)" },
        { status: 400 }
      );
    }

    // Fetch promoter from database
    const promoter = await Promoter.findById(promoterId);
    if (!promoter) {
      return NextResponse.json(
        { error: "প্রমোটার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Check if promoter has sufficient balance
    if (promoter.availableBalance < amount) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।" },
        { status: 400 }
      );
    }

    // Deduct amount from promoter's availableBalance
    promoter.availableBalance -= amount;
    await promoter.save();

    // Create payout request with status 'Pending'
    const payoutRequest = await PayoutRequest.create({
      promoterId,
      amount,
      paymentMethod,
      accountDetails,
      status: "Pending",
    });

    // Return successful response
    return NextResponse.json(
      {
        message:
          "আলহামদুলিল্লাহ, আপনার উত্তোলনের আবেদনটি সফলভাবে গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।",
        payoutRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { error: "উত্তোলন আবেদনে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
