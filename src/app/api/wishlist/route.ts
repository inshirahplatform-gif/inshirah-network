import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Wishlist, Product } from "@/models";

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
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

    const wishlistItems = await Wishlist.find({ userId: session.userId }).lean();
    const productIds = wishlistItems.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    }).lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json({ error: "উইশলিস্ট লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
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
    const { productId } = body as { productId: string };

    if (!productId) {
      return NextResponse.json({ error: "প্রোডাক্ট ID প্রয়োজন" }, { status: 400 });
    }

    await dbConnect();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "প্রোডাক্ট পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: session.userId,
      productId,
    });

    if (existing) {
      return NextResponse.json({ error: "ইতিমধ্যে উইশলিস্টে আছে" }, { status: 400 });
    }

    await Wishlist.create({
      userId: session.userId,
      productId,
    });

    return NextResponse.json({ message: "উইশলিস্টে যোগ করা হয়েছে" }, { status: 201 });
  } catch (error) {
    console.error("Wishlist add error:", error);
    return NextResponse.json({ error: "উইশলিস্টে যোগ করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
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
    const { productId } = body as { productId: string };

    if (!productId) {
      return NextResponse.json({ error: "প্রোডাক্ট ID প্রয়োজন" }, { status: 400 });
    }

    await dbConnect();

    await Wishlist.deleteOne({
      userId: session.userId,
      productId,
    });

    return NextResponse.json({ message: "উইশলিস্ট থেকে সরানো হয়েছে" });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json({ error: "সরাতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
