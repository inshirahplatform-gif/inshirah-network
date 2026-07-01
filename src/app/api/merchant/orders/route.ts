import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Order, Promoter } from "@/models";

export async function PATCH(request: NextRequest) {
  try {
    // Database connection
    await dbConnect();

    // Extract request body
    const body = await request.json();
    const { orderId, status } = body;

    // Validate required fields
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId এবং status প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    // Validate status
    if (status !== "Delivered") {
      return NextResponse.json(
        { error: "status হতে হবে 'Delivered'" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Order Validation: Check if already delivered or cancelled
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return NextResponse.json(
        { error: "এই অর্ডারের স্ট্যাটাস ইতিমধ্যে আপডেট করা হয়েছে।" },
        { status: 400 }
      );
    }

    // Profit Split Logic (80/20 Distribution)
    if (order.promoterId && order.commissionAmount > 0) {
      const totalCommission = order.commissionAmount;
      
      // Calculate shares
      const promoterShare = totalCommission * 0.8; // 80% for promoter
      const platformShare = totalCommission * 0.2; // 20% for platform

      // Find and update promoter
      const promoter = await Promoter.findById(order.promoterId);
      if (promoter) {
        // Deduct from pending balance (was added when order was placed)
        promoter.pendingBalance -= totalCommission;
        
        // Add promoter's 80% share to availableBalance
        promoter.availableBalance += promoterShare;
        
        // Add promoter's 80% share to totalEarned
        promoter.totalEarned += promoterShare;
        
        await promoter.save();
      }
    } else if (order.promoterId && order.commissionAmount > 0) {
      // If no promoter, just clear pending balance (shouldn't happen but safety check)
      const promoter = await Promoter.findById(order.promoterId);
      if (promoter) {
        promoter.pendingBalance -= order.commissionAmount;
        await promoter.save();
      }
    }

    // Update Order Status to 'Delivered'
    order.status = "Delivered";
    await order.save();

    // Return successful response
    return NextResponse.json(
      {
        message: "আলহামদুলিল্লাহ, অর্ডারটি সফলভাবে ডেলিভার্ড মার্ক করা হয়েছে এবং প্রমোটার কমিশন স্বয়ংক্রিয়ভাবে ভাগ হয়ে ওয়ালেটে জমা হয়েছে।",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "অর্ডার স্ট্যাটাস আপডেটে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
