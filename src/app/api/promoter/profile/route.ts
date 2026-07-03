import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Promoter } from "@/models";

export async function GET(_request: NextRequest) {
  try {
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
        { error: "অ্যাক্সেস নিষিদ্ধ" },
        { status: 403 }
      );
    }

    await dbConnect();

    const promoter = await Promoter.findById(session.userId)
      .select("-passwordHash")
      .lean();

    if (!promoter) {
      return NextResponse.json(
        { error: "প্রমোটার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ promoter }, { status: 200 });
  } catch (error) {
    console.error("Promoter profile fetch error:", error);
    return NextResponse.json(
      { error: "প্রোফাইল লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
