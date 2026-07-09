import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

// Public endpoint — no auth required.
// Returns a single product by ID.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { error: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Get related products from same category with better sorting
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      status: "active",
    })
      .sort({ averageRating: -1, stockQuantity: -1 })
      .limit(4)
      .select("title price imageUrl averageRating totalReviews commissionPercentage")
      .lean();

    // Get popular products for "recommended for you"
    const recommendedProducts = await Product.find({
      _id: { $ne: id },
      status: "active",
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(4)
      .select("title price imageUrl averageRating totalReviews commissionPercentage")
      .lean();

    return NextResponse.json({ product, relatedProducts, recommendedProducts }, { status: 200 });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
