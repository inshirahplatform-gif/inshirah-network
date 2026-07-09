import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Wallet, WithdrawRequest, WalletTransaction } from "@/models";
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { startSession } from "mongoose";

export async function POST(request: NextRequest) {
  const session = await startSession();
  session.startTransaction();

  try {
    await dbConnect();

    // Verify user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userSession = await verifySession(sessionCookie.value);
    if (!userSession) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, paymentMethod, accountDetails } = body;

    // Validate input
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["bKash", "Nagad", "Bank"].includes(paymentMethod)) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (!accountDetails || accountDetails.trim() === "") {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Account details are required" },
        { status: 400 }
      );
    }

    // Determine user type based on role
    const userType = userSession.role === "merchant" ? "merchant" : "promoter";

    // Get user's wallet
    const wallet = await Wallet.findOne({
      userId: userSession.userId,
      userType: userType,
    }).session(session);

    if (!wallet) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    const availableBalance = wallet.currentBalance - wallet.lockedBalance;
    if (availableBalance < amount) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Insufficient balance", availableBalance },
        { status: 400 }
      );
    }

    // Lock the amount in wallet
    const balanceBefore = wallet.currentBalance;
    wallet.lockedBalance += amount;
    await wallet.save({ session });

    // Create withdrawal request
    const withdrawRequest = new WithdrawRequest({
      userId: userSession.userId,
      userType: userType,
      amount: amount,
      paymentMethod: paymentMethod,
      accountDetails: accountDetails,
      status: "PENDING",
    });
    await withdrawRequest.save({ session });

    // Create wallet transaction record
    const transaction = new WalletTransaction({
      walletId: wallet._id.toString(),
      userId: wallet.userId,
      userType: userType,
      amount: amount,
      type: "DEBIT",
      purpose: "WITHDRAWAL",
      withdrawRequestId: withdrawRequest._id.toString(),
      status: "PENDING",
      balanceBefore: balanceBefore,
      balanceAfter: wallet.currentBalance,
      description: `Withdrawal request - ${paymentMethod}`,
    });
    await transaction.save({ session });

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully",
        withdrawRequestId: withdrawRequest._id,
        amount: amount,
        status: "PENDING",
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userSession = await verifySession(sessionCookie.value);
    if (!userSession) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const userType = userSession.role === "merchant" ? "merchant" : "promoter";

    // Get user's withdrawal requests
    const withdrawRequests = await WithdrawRequest.find({
      userId: userSession.userId,
      userType: userType,
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      { withdrawRequests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get withdrawal requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    );
  }
}
