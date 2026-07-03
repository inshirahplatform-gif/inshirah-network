import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { signSession, COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/session";
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

    let user: {
      _id: { toString(): string } | string;
      email: string;
      passwordHash?: string;
      fullName?: string;
      ownerName?: string;
      role?: string;
    } | null = null;
    let redirectTarget = "";

    // Role-based authentication
    if (role === "promoter") {
      user = await Promoter.findOne({ email: email.toLowerCase() }).lean();
      redirectTarget = "/promoter/dashboard";
    } else if (role === "merchant") {
      user = await Merchant.findOne({ email: email.toLowerCase() }).lean();
      redirectTarget = "/merchant/dashboard";
    } else if (role === "admin") {
      // Admin credentials must come entirely from environment variables.
      // No hardcoded fallback is allowed.
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error(
          "ADMIN_EMAIL বা ADMIN_PASSWORD পরিবেশ ভেরিয়েবল সেট করা নেই।"
        );
        return NextResponse.json(
          { error: "সার্ভার কনফিগারেশন সমস্যা। অ্যাডমিনের সাথে যোগাযোগ করুন।" },
          { status: 500 }
        );
      }

      if (
        email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD
      ) {
        user = {
          _id: "admin-001",
          email: ADMIN_EMAIL,
          role: "admin",
        };
        redirectTarget = "/admin/dashboard";
      }
    }

    // Validation: Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
        { status: 401 }
      );
    }

    // Password verification for promoter and merchant
    if (role === "promoter" || role === "merchant") {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
          { status: 401 }
        );
      }

      const isPasswordValid = verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "দুঃখিত, আপনার প্রদানকৃত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।" },
          { status: 401 }
        );
      }
    }

    // Build session payload and sign it as a secure JWT
    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: role as "promoter" | "merchant" | "admin",
      name:
        role === "promoter"
          ? (user.fullName ?? "")
          : role === "merchant"
          ? (user.ownerName ?? "")
          : "Admin",
    };

    const signedToken = await signSession(sessionPayload);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার লগ-ইন সফল হয়েছে!",
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
      { error: "লগ-ইনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
