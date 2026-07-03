import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PasswordResetToken, Promoter, Merchant } from "@/models";
import { hashPassword } from "@/models/promoter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, role, newPassword } = body as {
      token?: string;
      role?: string;
      newPassword?: string;
    };

    if (!token || !role || !newPassword) {
      return NextResponse.json(
        { error: "টোকেন, রোল এবং নতুন পাসওয়ার্ড প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    if (!["promoter", "merchant"].includes(role)) {
      return NextResponse.json(
        { error: "অবৈধ রোল" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and validate the token
    const resetToken = await PasswordResetToken.findOne({ token, role });

    if (!resetToken) {
      return NextResponse.json(
        { error: "রিসেট লিংকটি অবৈধ বা মেয়াদ শেষ হয়ে গেছে। নতুন লিংকের জন্য আবার অনুরোধ করুন।" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json(
        { error: "রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে। নতুন লিংকের জন্য আবার অনুরোধ করুন।" },
        { status: 400 }
      );
    }

    // Hash the new password and update the correct model
    const newPasswordHash = hashPassword(newPassword);

    if (role === "promoter") {
      await Promoter.findByIdAndUpdate(resetToken.userId, {
        passwordHash: newPasswordHash,
      });
    } else {
      await Merchant.findByIdAndUpdate(resetToken.userId, {
        passwordHash: newPasswordHash,
      });
    }

    // Delete the used token immediately (single-use)
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json(
      {
        message:
          "আলহামদুলিল্লাহ, আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগ-ইন করুন।",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
