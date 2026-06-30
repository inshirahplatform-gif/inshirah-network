import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const {
      title,
      description,
      price,
      commissionPercentage,
      merchantId,
      stockQuantity,
    } = body;

    // Validate required fields
    if (!title || !description || !price || !commissionPercentage || !merchantId || stockQuantity === undefined) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Shariah compliance validation: stockQuantity must be at least 1
    if (typeof stockQuantity !== "number" || stockQuantity < 1) {
      return NextResponse.json(
        {
          error: "শারীয়াহ কমপ্লায়েন্স নিশ্চিত করতে ন্যূনতম ১ পিস ফিজিক্যাল স্টক থাকা বাধ্যতামূলক।",
        },
        { status: 400 }
      );
    }

    // Validate price and commissionPercentage are positive numbers
    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "মূল্য একটি ধনাত্মক সংখ্যা হতে হবে" },
        { status: 400 }
      );
    }

    if (typeof commissionPercentage !== "number" || commissionPercentage <= 0 || commissionPercentage > 100) {
      return NextResponse.json(
        { error: "কমিশন শতাংশ ০-১০০ এর মধ্যে হতে হবে" },
        { status: 400 }
      );
    }

    // Create product with active status (since stockQuantity >= 1)
    const product = await Product.create({
      title,
      description,
      price,
      commissionPercentage,
      merchantId,
      stockQuantity,
      status: "active",
    });

    // Return successful response
    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, প্রোডাক্টটি সফলভাবে লাইভ করা হয়েছে!",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product upload error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট আপলোডে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
