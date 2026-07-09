import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";

// Simple in-memory storage for price alerts (in production, use database)
const priceAlerts = new Map<string, Array<{ productId: string; targetPrice: number }>>();

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে লগ-ইন করুন" },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, targetPrice } = body;

    if (!productId || !targetPrice) {
      return NextResponse.json(
        { error: "প্রোডাক্ট ID এবং টার্গেট প্রাইস প্রয়োজন" },
        { status: 400 }
      );
    }

    // Get existing alerts for user
    const userAlerts = priceAlerts.get(session.userId) || [];
    
    // Check if alert already exists
    const existingAlert = userAlerts.find(alert => alert.productId === productId);
    if (existingAlert) {
      return NextResponse.json(
        { error: "এই প্রোডাক্টের জন্য ইতিমধ্যেই এলার্ট সেট করা আছে" },
        { status: 400 }
      );
    }

    // Add new alert
    userAlerts.push({ productId, targetPrice });
    priceAlerts.set(session.userId, userAlerts);

    return NextResponse.json(
      { message: "প্রাইস এলার্ট সেট করা হয়েছে" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Price alert error:", error);
    return NextResponse.json(
      { error: "প্রাইস এলার্ট সেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে লগ-ইন করুন" },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    const userAlerts = priceAlerts.get(session.userId) || [];

    return NextResponse.json({ alerts: userAlerts }, { status: 200 });
  } catch (error) {
    console.error("Price alerts fetch error:", error);
    return NextResponse.json(
      { error: "প্রাইস এলার্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে লগ-ইন করুন" },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "প্রোডাক্ট ID প্রয়োজন" },
        { status: 400 }
      );
    }

    const userAlerts = priceAlerts.get(session.userId) || [];
    const updatedAlerts = userAlerts.filter(alert => alert.productId !== productId);
    priceAlerts.set(session.userId, updatedAlerts);

    return NextResponse.json(
      { message: "প্রাইস এলার্ট মুছে ফেলা হয়েছে" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Price alert delete error:", error);
    return NextResponse.json(
      { error: "প্রাইস এলার্ট মুছে ফেলতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
