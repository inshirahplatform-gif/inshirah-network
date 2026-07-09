import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { WithdrawRequest, Wallet, WalletTransaction } from "@/models";
import { startSession } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await startSession();
  session.startTransaction();

  try {
    await dbConnect();

    const { requestId } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Fetch withdrawal request
    const withdrawRequest = await WithdrawRequest.findById(requestId).session(session);
    if (!withdrawRequest) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (withdrawRequest.status !== "PENDING") {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Withdrawal request already processed" },
        { status: 400 }
      );
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({
      userId: withdrawRequest.userId,
      userType: withdrawRequest.userType,
    }).session(session);

    if (!wallet) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      // Unlock the amount in wallet
      wallet.lockedBalance -= withdrawRequest.amount;
      await wallet.save({ session });

      // Update withdrawal request
      withdrawRequest.status = "REJECTED";
      withdrawRequest.rejectionReason = rejectionReason;
      withdrawRequest.processedAt = new Date();
      await withdrawRequest.save({ session });

      // Update wallet transaction
      await WalletTransaction.findOneAndUpdate(
        {
          withdrawRequestId: requestId,
          status: "PENDING",
        },
        {
          status: "FAILED",
          description: `Withdrawal rejected - ${rejectionReason}`,
        },
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json(
        { message: "Withdrawal request rejected successfully" },
        { status: 200 }
      );
    }

    // Approve withdrawal
    const balanceBefore = wallet.currentBalance;
    wallet.currentBalance -= withdrawRequest.amount;
    wallet.totalWithdrawn += withdrawRequest.amount;
    wallet.lockedBalance -= withdrawRequest.amount;
    await wallet.save({ session });

    // Update withdrawal request
    withdrawRequest.status = "APPROVED";
    withdrawRequest.processedAt = new Date();
    await withdrawRequest.save({ session });

    // Update wallet transaction
    await WalletTransaction.findOneAndUpdate(
      {
        withdrawRequestId: requestId,
        status: "PENDING",
      },
      {
        status: "SUCCESS",
        balanceAfter: wallet.currentBalance,
        description: `Withdrawal approved - ${withdrawRequest.paymentMethod}`,
      },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Withdrawal request approved successfully",
        amount: withdrawRequest.amount,
        newBalance: wallet.currentBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Process withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal request" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    await dbConnect();

    const { requestId } = await params;

    const withdrawRequest = await WithdrawRequest.findById(requestId);

    if (!withdrawRequest) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { withdrawRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get withdrawal request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawal request" },
      { status: 500 }
    );
  }
}
