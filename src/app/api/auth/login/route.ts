import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Promoter, Merchant } from "@/models";
import { verifyPassword } from "@/models/promoter";

export async function POST(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const { email, password, role } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "ইমেইল, পাসওয়ার্ড এবং রোল প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["promoter", "merchant", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "অবৈধ রোল" },
        { status: 400 }
      );
    }

    let user: any = null;
    let redirectTarget = "";

    // Role-based authentication
    if (role === "promoter") {
      user = await Promoter.findOne({ email: email.toLowerCase() }).lean();
      redirectTarget = "/promoter/dashboard";
    } else if (role === "merchant") {
      user = await Merchant.findOne({ email: email.toLowerCase() }).lean();
      redirectTarget = "/merchant/dashboard";
    } else if (role === "admin") {
      // Mock admin credentials (in production, use Admin model)
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@inshirah.com";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        user = {
          _id: "admin-001",
          email: ADMIN_EMAIL,
          role: "admin",
        };
        redirectTarget = "/admin/dashboard";
      }
    }

    // Validation: Check if user exists and password matches
    if (!user) {
      return NextResponse.json(
        { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
        { status: 401 }
      );
    }

    // Password verification for promoter and merchant
    if (role === "promoter" || role === "merchant") {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
          { status: 401 }
        );
      }

      const isPasswordValid = verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
          { status: 401 }
        );
      }
    }

    // Session/Cookie Setup
    const cookieStore = await cookies();
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      role: role,
      name: role === "promoter" ? user.fullName : role === "merchant" ? user.ownerName : "Admin",
    };

    cookieStore.set("inshirah_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Return successful response
    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার লগ-ইন সফল হয়েছে!",
        redirectTarget,
        user: {
          id: user._id.toString(),
          email: user.email,
          role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "লগ-ইনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
