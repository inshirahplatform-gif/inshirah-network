import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

// Public endpoint — no auth required.
// Returns all active products sorted by newest first.
export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select("title price commissionPercentage stockQuantity imageUrl")
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
