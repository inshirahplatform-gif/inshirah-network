import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params;
    await dbConnect();

    const products = await Product.find({
      merchantId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .select("title price imageUrl stockQuantity averageRating")
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Merchant products fetch error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
