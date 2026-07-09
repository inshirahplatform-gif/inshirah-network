import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// Mock deals data - in production, this would come from database
const mockDeals = [
  {
    _id: "1",
    title: "ঈদ বিশেষ ডিসকাউন্ট",
    description: "সব ইলেকট্রনিক্স প্রোডাক্টে ১৫% ছাড়",
    discountPercentage: 15,
    originalPrice: 10000,
    discountedPrice: 8500,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    minPurchase: 5000,
    maxDiscount: 2000,
  },
  {
    _id: "2",
    title: "পোশাক কালেকশন অফার",
    description: "নতুন পোশাক কালেকশনে ২০% ছাড়",
    discountPercentage: 20,
    originalPrice: 3000,
    discountedPrice: 2400,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    minPurchase: 2000,
    maxDiscount: 1000,
  },
];

export async function GET(request: NextRequest) {
  try {
    // Filter expired deals
    const now = new Date();
    const activeDeals = mockDeals.filter((deal) => new Date(deal.validUntil) > now);

    return NextResponse.json({ deals: activeDeals }, { status: 200 });
  } catch (error) {
    console.error("Deals fetch error:", error);
    return NextResponse.json(
      { error: "ডিল লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
