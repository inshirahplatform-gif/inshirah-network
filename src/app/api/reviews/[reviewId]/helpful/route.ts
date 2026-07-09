import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Review } from "@/models";

interface RouteParams {
  params: Promise<{ reviewId: string }>;
}

// POST /api/reviews/[reviewId]/helpful - Mark review as helpful
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "রিভিউ পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if user already voted (simplified - in production, use a separate collection)
    // For now, just increment the count
    review.helpfulCount += 1;
    await review.save();

    return NextResponse.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error("Helpful vote error:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}
