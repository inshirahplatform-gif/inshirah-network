import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Order, Product, Promoter } from "@/models";

export async function POST(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const { productId, customerName, customerPhone, shippingAddress } = body;

    // Validate required fields
    if (!productId || !customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    // Read tracking cookie for promoter ID
    const cookieStore = await cookies();
    const referrerCookie = cookieStore.get("inshirah_referrer");
    let promoterId: string | undefined;

    if (referrerCookie && referrerCookie.value) {
      promoterId = referrerCookie.value;
    }

    // Fetch product from database
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "প্রোডাক্ট পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Shariah & Stock Validation: Check if stock is available
    if (product.stockQuantity < 1) {
      return NextResponse.json(
        {
          error: "দুঃখিত, এই প্রোডাক্টটির স্টক এইমাত্র শেষ হয়ে গেছে। স্টক ছাড়া অর্ডার গ্রহণ করা শরীয়াহ পরিপন্থী।",
        },
        { status: 400 }
      );
    }

    // Update stock: Deduct 1 from product's stockQuantity
    product.stockQuantity -= 1;

    // If stock becomes 0, update status to 'hidden'
    if (product.stockQuantity === 0) {
      product.status = "hidden";
    }

    await product.save();

    // Calculate commission if promoter exists
    let commissionAmount = 0;
    if (promoterId) {
      commissionAmount = (product.price * product.commissionPercentage) / 100;
    }

    // Create and save the order
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

    // If promoter exists, update their balances
    if (promoterId && commissionAmount > 0) {
      const promoter = await Promoter.findById(promoterId);
      if (promoter) {
        promoter.pendingBalance += commissionAmount;
        promoter.totalEarned += commissionAmount;
        await promoter.save();
      }
    }

    // Return successful response
    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      { error: "অর্ডার গ্রহণে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
