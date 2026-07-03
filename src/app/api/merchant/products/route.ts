import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Product } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // Verify session — merchantId comes from the signed cookie, never from body
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

    if (session.role !== "merchant") {
      return NextResponse.json(
        { error: "শুধুমাত্র মার্চেন্ট প্রোডাক্ট আপলোড করতে পারবেন।" },
        { status: 403 }
      );
    }

    // merchantId is taken exclusively from the verified session
    const merchantId = session.userId;

    // Extract product fields from body (merchantId is intentionally excluded)
    const body = await request.json();
    const { title, description, price, commissionPercentage, stockQuantity } = body;

    // Validate required fields
    if (!title || !description || price === undefined || commissionPercentage === undefined || stockQuantity === undefined) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Shariah compliance: minimum 1 unit of physical stock
    if (typeof stockQuantity !== "number" || stockQuantity < 1) {
      return NextResponse.json(
        {
          error: "শারীয়াহ কমপ্লায়েন্স নিশ্চিত করতে ন্যূনতম ১ পিস ফিজিক্যাল স্টক থাকা বাধ্যতামূলক।",
        },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "মূল্য একটি ধনাত্মক সংখ্যা হতে হবে" },
        { status: 400 }
      );
    }

    if (
      typeof commissionPercentage !== "number" ||
      commissionPercentage <= 0 ||
      commissionPercentage > 100
    ) {
      return NextResponse.json(
        { error: "কমিশন শতাংশ ০-১০০ এর মধ্যে হতে হবে" },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.create({
      title,
      description,
      price,
      commissionPercentage,
      merchantId,
      stockQuantity,
      status: "active",
    });

    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, প্রোডাক্টটি সফলভাবে লাইভ করা হয়েছে!",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product upload error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট আপলোডে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
