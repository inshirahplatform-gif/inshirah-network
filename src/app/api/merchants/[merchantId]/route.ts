import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Merchant, Product } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params;
    await dbConnect();

    const merchant = await Merchant.findById(merchantId).lean();

    if (!merchant) {
      return NextResponse.json(
        { error: "মার্চেন্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Get merchant stats
    const totalProducts = await Product.countDocuments({
      merchantId,
      status: "active",
    });

    const merchantData = {
      ...merchant,
      totalProducts,
      totalOrders: 0, // TODO: Calculate from orders
      averageRating: 0, // TODO: Calculate from reviews
      totalReviews: 0, // TODO: Calculate from reviews
    };

    return NextResponse.json({ merchant: merchantData }, { status: 200 });
  } catch (error) {
    console.error("Merchant fetch error:", error);
    return NextResponse.json(
      { error: "মার্চেন্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
