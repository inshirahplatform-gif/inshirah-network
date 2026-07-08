import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Order } from "@/models";

// Public endpoint - no auth required for order tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const order = await Order.findById(id)
      .populate("items.productId")
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "অর্ডার লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
