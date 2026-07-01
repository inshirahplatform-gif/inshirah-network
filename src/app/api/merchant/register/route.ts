import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Merchant } from "@/models";
import { hashPassword } from "@/models/promoter";

export async function POST(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const {
      businessName,
      ownerName,
      email,
      phone,
      password,
      shariahAgreement,
    } = body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "সব আবশ্যক তথ্য পূরণ করুন" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "সঠিক ইমেইল ঠিকানা লিখুন" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    // Validate Shariah agreement
    if (!shariahAgreement) {
      return NextResponse.json(
        {
          error: "অ্যাকাউন্ট তৈরি করতে শরীয়াহ চুক্তিতে সম্মতি দিতে হবে",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingMerchant = await Merchant.findOne({ email }).lean();
    if (existingMerchant) {
      return NextResponse.json(
        { error: "এই ইমেইলটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে" },
        { status: 409 }
      );
    }

    // Create merchant with hashed password
    await Merchant.create({
      businessName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashPassword(password),
      isVerified: false,
    });

    // Return successful response
    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার মার্চেন্ট অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Merchant registration error:", error);
    return NextResponse.json(
      { error: "নিবন্ধন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
