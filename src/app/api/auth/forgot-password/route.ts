import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import { sendMail } from "@/lib/mailer";
import { Promoter, Merchant, PasswordResetToken } from "@/models";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body as { email?: string; role?: string };

    if (!email || !role) {
      return NextResponse.json(
        { error: "ইমেইল এবং রোল প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    if (!["promoter", "merchant"].includes(role)) {
      return NextResponse.json(
        { error: "অবৈধ রোল। শুধুমাত্র promoter বা merchant সমর্থিত।" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user — intentionally return the same success message
    // whether the email exists or not (prevents user enumeration)
    const normalizedEmail = email.trim().toLowerCase();
    const user =
      role === "promoter"
        ? await Promoter.findOne({ email: normalizedEmail }).lean()
        : await Merchant.findOne({ email: normalizedEmail }).lean();

    const SUCCESS_MSG =
      "যদি এই ইমেইলটি আমাদের সিস্টেমে নিবন্ধিত থাকে, তাহলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।";

    if (!user) {
      // Do not reveal whether the email exists
      return NextResponse.json({ message: SUCCESS_MSG }, { status: 200 });
    }

    // Delete any existing tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id, role });

    // Generate a cryptographically secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await PasswordResetToken.create({
      userId: user._id,
      role,
      token,
      expiresAt,
    });

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&role=${role}`;

    const userName =
      role === "promoter"
        ? (user as { fullName?: string }).fullName ?? "ব্যবহারকারী"
        : (user as { ownerName?: string }).ownerName ?? "মার্চেন্ট";

    await sendMail({
      to: normalizedEmail,
      subject: "ইনশিরাহ — পাসওয়ার্ড রিসেট লিংক",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#09090b;color:#fafafa;border-radius:12px;padding:32px;">
          <h1 style="font-size:22px;font-weight:700;color:#34d399;margin:0 0 8px;">ইনশিরাহ নেটওয়ার্ক</h1>
          <p style="font-size:14px;color:#a1a1aa;margin:0 0 24px;">পাসওয়ার্ড রিসেট অনুরোধ</p>
          <p style="font-size:15px;color:#e4e4e7;margin:0 0 16px;">আস-সালামু আলাইকুম, <strong>${userName}</strong>,</p>
          <p style="font-size:14px;color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
            আপনার ইনশিরাহ অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের অনুরোধ পাওয়া গেছে।
            নিচের বোতামে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
            এই লিংকটি <strong style="color:#fbbf24;">১ ঘণ্টা</strong> পরে মেয়াদ শেষ হয়ে যাবে।
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;
                    text-decoration:none;padding:12px 28px;border-radius:10px;margin-bottom:24px;">
            পাসওয়ার্ড রিসেট করুন
          </a>
          <p style="font-size:12px;color:#52525b;margin:0 0 4px;">
            যদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
          </p>
          <p style="font-size:12px;color:#52525b;margin:0;">
            অথবা এই লিংকটি ব্রাউজারে কপি করুন:<br/>
            <span style="color:#6ee7b7;word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: SUCCESS_MSG }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "পাসওয়ার্ড রিসেট ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
