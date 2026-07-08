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

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "প্রোডাক্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
