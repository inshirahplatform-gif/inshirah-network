import { dbConnect } from "@/lib/dbConnect";
import {
  Promoter,
  hashPassword,
  normalizeWhatsappNumber,
} from "@/models/promoter";
import { NextResponse } from "next/server";

type RegisterPayload = {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  password?: string;
  agreedToShariah?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;
    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const whatsapp = body.whatsapp?.trim() ?? "";
    const password = body.password ?? "";
    const agreedToShariah = body.agreedToShariah === true;

    if (!fullName || !email || !whatsapp || !password) {
      return NextResponse.json(
        { message: "সব আবশ্যক তথ্য পূরণ করুন।" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "সঠিক ইমেইল ঠিকানা লিখুন।" },
        { status: 400 },
      );
    }

    const normalizedWhatsapp = normalizeWhatsappNumber(whatsapp);
    if (!normalizedWhatsapp) {
      return NextResponse.json(
        { message: "বাংলাদেশি মোবাইল নম্বর (০১XXXXXXXXX) লিখুন।" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।" },
        { status: 400 },
      );
    }

    if (!agreedToShariah) {
      return NextResponse.json(
        { message: "অ্যাকাউন্ট তৈরি করতে ইনশিরাহ প্ল্যাটফর্মের \"জু'আলাহ ও দা'লালী\" সংক্রান্ত শরয়ী নীতিমালা এবং শর্তাবলীতে সম্মত হওয়া বাধ্যতামূলক।" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingPromoter = await Promoter.findOne({ email }).lean();
    if (existingPromoter) {
      return NextResponse.json(
        { message: "এই ইমেইলটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।" },
        { status: 409 },
      );
    }

    await Promoter.create({
      fullName,
      email,
      whatsapp: normalizedWhatsapp,
      passwordHash: hashPassword(password),
      agreedToShariah,
      role: "promoter",
    });

    return NextResponse.json({
      message: "আলহামদুলিল্লাহ, আপনার প্রমোটার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে!",
    });
  } catch (error) {
    console.error("Promoter registration failed:", error);
    return NextResponse.json(
      { message: "নিবন্ধন সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
