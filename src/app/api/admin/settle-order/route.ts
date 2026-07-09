import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Order, Wallet, WalletTransaction, Merchant, Promoter } from "@/models";
import { startSession } from "mongoose";

// Platform fee percentage (e.g., 5% of order amount)
const PLATFORM_FEE_PERCENTAGE = 0.05;

export async function POST(request: NextRequest) {
  const session = await startSession();
  session.startTransaction();

  try {
    await dbConnect();

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order details
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already settled
    if (order.commissionStatus === "released") {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Order funds already settled" },
        { status: 400 }
      );
    }

    // Check if order is delivered
    if (order.status !== "Delivered") {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Order must be delivered before settling funds" },
        { status: 400 }
      );
    }

    // Calculate splits
    const totalAmount = order.totalAmount;
    const promoterCommission = order.commissionAmount || 0;
    const platformFee = totalAmount * PLATFORM_FEE_PERCENTAGE;
    const merchantShare = totalAmount - promoterCommission - platformFee;

    // Get or create merchant wallet
    let merchantWallet = await Wallet.findOne({
      userId: order.items[0].merchantId.toString(),
      userType: "merchant",
    }).session(session);

    if (!merchantWallet) {
      merchantWallet = new Wallet({
        userId: order.items[0].merchantId.toString(),
        userType: "merchant",
        currentBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        lockedBalance: 0,
      });
    }

    // Update merchant wallet
    const merchantBalanceBefore = merchantWallet.currentBalance;
    merchantWallet.currentBalance += merchantShare;
    merchantWallet.totalEarned += merchantShare;
    await merchantWallet.save({ session });

    // Create merchant wallet transaction
    const merchantTransaction = new WalletTransaction({
      walletId: merchantWallet._id.toString(),
      userId: merchantWallet.userId,
      userType: "merchant",
      amount: merchantShare,
      type: "CREDIT",
      purpose: "ORDER_COMMISSION",
      orderId: orderId,
      status: "SUCCESS",
      balanceBefore: merchantBalanceBefore,
      balanceAfter: merchantWallet.currentBalance,
      description: `Order settlement - Order #${orderId}`,
    });
    await merchantTransaction.save({ session });

    // Handle promoter wallet if promoter exists
    if (order.promoterId) {
      let promoterWallet = await Wallet.findOne({
        userId: order.promoterId.toString(),
        userType: "promoter",
      }).session(session);

      if (!promoterWallet) {
        promoterWallet = new Wallet({
          userId: order.promoterId.toString(),
          userType: "promoter",
          currentBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          lockedBalance: 0,
        });
      }

      // Update promoter wallet
      const promoterBalanceBefore = promoterWallet.currentBalance;
      promoterWallet.currentBalance += promoterCommission;
      promoterWallet.totalEarned += promoterCommission;
      await promoterWallet.save({ session });

      // Create promoter wallet transaction
      const promoterTransaction = new WalletTransaction({
        walletId: promoterWallet._id.toString(),
        userId: promoterWallet.userId,
        userType: "promoter",
        amount: promoterCommission,
        type: "CREDIT",
        purpose: "ORDER_COMMISSION",
        orderId: orderId,
        status: "SUCCESS",
        balanceBefore: promoterBalanceBefore,
        balanceAfter: promoterWallet.currentBalance,
        description: `Commission from order #${orderId}`,
      });
      await promoterTransaction.save({ session });
    }

    // Update order commission status
    order.commissionStatus = "released";
    order.escrowReleaseDate = new Date();
    await order.save({ session });

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Order funds settled successfully",
        splits: {
          promoterShare: promoterCommission,
          platformFee: platformFee,
          merchantShare: merchantShare,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Settle order funds error:", error);
    return NextResponse.json(
      { error: "Failed to settle order funds" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
