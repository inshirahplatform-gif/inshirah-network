import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { Installment, Order } from "@/models";

// Calculate installment plan based on Murabaha (cost-plus) or Ijara (leasing)
function calculateInstallmentPlan(
  totalAmount: number,
  type: "murabaha" | "ijara",
  installmentCount: number
) {
  // Murabaha: No interest, but a reasonable profit margin (e.g., 10-15%)
  // This is Shariah-compliant as it's a cost-plus arrangement
  const murabahaMargin = type === "murabaha" ? 0.12 : 0; // 12% profit margin for Murabaha
  
  // Total amount with profit margin (for Murabaha)
  const totalWithMargin = totalAmount * (1 + murabahaMargin);
  
  // Down payment (typically 20-30%)
  const downPaymentPercentage = 0.25; // 25% down payment
  const downPayment = totalWithMargin * downPaymentPercentage;
  
  // Remaining amount for installments
  const remainingAmount = totalWithMargin - downPayment;
  
  // Monthly installment amount
  const installmentAmount = remainingAmount / installmentCount;
  
  return {
    totalAmount: totalWithMargin,
    downPayment,
    installmentAmount,
    installmentCount,
    installmentPeriod: 30, // 30 days per installment
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, type, installmentCount } = body;

    if (!orderId || !type || !installmentCount) {
      return NextResponse.json(
        { error: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 }
      );
    }

    if (!["murabaha", "ijara"].includes(type)) {
      return NextResponse.json(
        { error: "অবৈধ ইনস্টলমেন্ট টাইপ" },
        { status: 400 }
      );
    }

    if (installmentCount < 3 || installmentCount > 12) {
      return NextResponse.json(
        { error: "ইনস্টলমেন্ট সংখ্যা ৩ থেকে ১২ এর মধ্যে হতে হবে" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if order belongs to the user
    if (order.userId && order.userId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "এই অর্ডারে ইনস্টলমেন্ট করার অনুমতি নেই" },
        { status: 403 }
      );
    }

    // Check if installment already exists for this order
    const existingInstallment = await Installment.findOne({ orderId });
    if (existingInstallment) {
      return NextResponse.json(
        { error: "এই অর্ডারের জন্য ইতিমধ্যে ইনস্টলমেন্ট প্ল্যান রয়েছে" },
        { status: 400 }
      );
    }

    // Calculate installment plan
    const plan = calculateInstallmentPlan(order.totalAmount, type, installmentCount);

    // Calculate next due date (30 days from now)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    // Create installment plan
    const installment = await Installment.create({
      orderId,
      userId: session.userId,
      totalAmount: plan.totalAmount,
      downPayment: plan.downPayment,
      installmentAmount: plan.installmentAmount,
      installmentCount: plan.installmentCount,
      installmentPeriod: plan.installmentPeriod,
      type,
      status: "active",
      paidInstallments: 0,
      nextDueDate,
    });

    return NextResponse.json(
      {
        message: "ইনস্টলমেন্ট প্ল্যান সফলভাবে তৈরি করা হয়েছে",
        installment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Installment creation error:", error);
    return NextResponse.json(
      { error: "ইনস্টলমেন্ট প্ল্যান তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "সেশন মেয়াদ শেষ। পুনরায় লগ-ইন করুন।" }, { status: 401 });
    }

    await dbConnect();

    const installments = await Installment.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ installments }, { status: 200 });
  } catch (error) {
    console.error("Installments fetch error:", error);
    return NextResponse.json(
      { error: "ইনস্টলমেন্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
