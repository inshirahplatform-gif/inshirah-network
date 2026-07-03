import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { PayoutRequest, Promoter } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // Verify session — promoterId comes from the signed cookie, never from body
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

    if (session.role !== "promoter") {
      return NextResponse.json(
        { error: "শুধুমাত্র প্রমোটার উত্তোলন করতে পারবেন।" },
        { status: 403 }
      );
    }

    // promoterId is taken exclusively from the verified session
    const promoterId = session.userId;

    // Extract only the fields that belong in the request body
    const body = await request.json();
    const { amount, paymentMethod, accountDetails } = body;

    // Validate required body fields
    if (!amount || !paymentMethod || !accountDetails) {
      return NextResponse.json(
        { error: "পরিমাণ, পেমেন্ট পদ্ধতি এবং অ্যাকাউন্ট বিবরণ প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount: ৳500
    if (typeof amount !== "number" || amount < 500) {
      return NextResponse.json(
        {
          error: "দুঃখিত, ন্যূনতম ৫০০ টাকা না হলে উত্তোলন রিকোয়েস্ট পাঠানো সম্ভব নয়।",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["bKash", "Nagad", "Bank"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "সঠিক পেমেন্ট মেথড নির্বাচন করুন (bKash, Nagad, Bank)" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch the promoter using the session-verified ID
    const promoter = await Promoter.findById(promoterId);
    if (!promoter) {
      return NextResponse.json(
        { error: "প্রমোটার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Check sufficient balance
    if (promoter.availableBalance < amount) {
      return NextResponse.json(
        { error: "আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।" },
        { status: 400 }
      );
    }

    // Deduct the amount and create the payout request atomically
    promoter.availableBalance -= amount;
    await promoter.save();

    const payoutRequest = await PayoutRequest.create({
      promoterId,
      amount,
      paymentMethod,
      accountDetails,
      status: "Pending",
    });

    return NextResponse.json(
      {
        message:
          "আলহামদুলিল্লাহ, আপনার উত্তোলনের আবেদনটি সফলভাবে গ্রহণ করা হয়েছে। অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।",
        payoutRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { error: "উত্তোলন আবেদনে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
