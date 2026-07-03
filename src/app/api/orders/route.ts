import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Order, Product, Promoter } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { productId, customerName, customerPhone, shippingAddress } = body;

    // Validate required fields
    if (!productId || !customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Read the referrer tracking cookie for promoter attribution
    const cookieStore = await cookies();
    const referrerCookie = cookieStore.get("inshirah_referrer");
    const promoterId: string | undefined = referrerCookie?.value || undefined;

    // Fetch and validate the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Shariah & stock validation
    if (product.stockQuantity < 1) {
      return NextResponse.json(
        {
          error:
            "দুঃখিত, এই প্রোডাক্টটির স্টক এইমাত্র শেষ হয়ে গেছে। স্টক ছাড়া অর্ডার গ্রহণ করা শরীয়াহ পরিপন্থী।",
        },
        { status: 400 }
      );
    }

    // Deduct stock and auto-hide if it hits zero
    product.stockQuantity -= 1;
    if (product.stockQuantity === 0) {
      product.status = "hidden";
    }
    await product.save();

    // Calculate commission amount (only meaningful if a promoter is attributed)
    const commissionAmount = promoterId
      ? (product.price * product.commissionPercentage) / 100
      : 0;

    // Create the order
    const order = await Order.create({
      productId,
      merchantId: product.merchantId,
      promoterId,
      customerName,
      customerPhone,
      shippingAddress,
      totalAmount: product.price,
      commissionAmount,
      status: "Pending",
    });

    // Credit the promoter's pendingBalance only.
    // totalEarned is updated later when the order is marked Delivered (80% share).
    if (promoterId && commissionAmount > 0) {
      const promoter = await Promoter.findById(promoterId);
      if (promoter) {
        promoter.pendingBalance += commissionAmount;
        await promoter.save();
      }
    }

    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      { error: "অর্ডার গ্রহণে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
