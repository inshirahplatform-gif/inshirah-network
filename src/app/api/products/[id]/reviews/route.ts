import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Review, Order } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]/reviews - Get all approved reviews for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    await dbConnect();

    const reviews = await Review.find({ productId, status: "approved" })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .lean();

    // Calculate rating summary
    const allReviews = await Review.find({ productId, status: "approved" });
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      ratingDistribution[r.rating - 1]++;
    });

    return NextResponse.json({
      reviews,
      summary: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "রিভিউ লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// POST /api/products/[id]/reviews - Submit a new review
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, rating, title, comment, images } = body as {
      orderId: string;
      rating: number;
      title: string;
      comment: string;
      images?: string[];
    };

    // Validation
    if (!orderId || !rating || !title || !comment) {
      return NextResponse.json({ error: "সব প্রয়োজনীয় তথ্য দিন" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "রেটিং ১-৫ এর মধ্যে হতে হবে" }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: "শিরোনাম সর্বোচ্চ ১০০ অক্ষর" }, { status: 400 });
    }

    if (comment.length > 1000) {
      return NextResponse.json({ error: "মন্তব্য সর্বোচ্চ ১০০০ অক্ষর" }, { status: 400 });
    }

    await dbConnect();

    // Check if user has purchased this product
    const order = await Order.findOne({
      _id: orderId,
      userId: session.userId,
    });

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if product is in the order
    const orderItem = order.items.find((item: any) => item.productId === productId);
    if (!orderItem) {
      return NextResponse.json({ error: "এই প্রোডাক্টটি আপনার অর্ডারে নেই" }, { status: 400 });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      productId,
      userId: session.userId,
    });

    if (existingReview) {
      return NextResponse.json({ error: "আপনি ইতিমধ্যে এই প্রোডাক্টটি রিভিউ করেছেন" }, { status: 400 });
    }

    // Create review
    const review = await Review.create({
      productId,
      userId: session.userId,
      orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true,
      status: "pending", // Requires admin approval
    });

    return NextResponse.json(
      { message: "রিভিউ জমা দেওয়া হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review submit error:", error);
    return NextResponse.json({ error: "রিভিয জমা দিতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
