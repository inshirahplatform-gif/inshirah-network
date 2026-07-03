import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

// Next.js 15/16: params and searchParams are Promises
interface PageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function ProductReferralPage({
  params,
  searchParams,
}: PageProps) {
  try {
    const { productId } = await params;
    const { ref: promoterId } = await searchParams;

    // Set referrer tracking cookie so the order route can attribute commission
    if (promoterId) {
      const cookieStore = await cookies();
      cookieStore.set("inshirah_referrer", promoterId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    await dbConnect();

    const product = await Product.findById(productId).lean();

    if (!product) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
          <div className="text-center">
            <p className="text-4xl">😔</p>
            <h1 className="mt-4 text-2xl font-bold text-zinc-50">
              প্রোডাক্টটি পাওয়া যায়নি
            </h1>
            <p className="mt-3 text-zinc-400">
              আপনি যে প্রোডাক্টটি খুঁজছেন তা বর্তমানে উপলব্ধ নেই।
            </p>
          </div>
        </div>
      );
    }

    if (product.status !== "active" || product.stockQuantity < 1) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
          <div className="text-center">
            <p className="text-4xl">📦</p>
            <h1 className="mt-4 text-2xl font-bold text-zinc-50">
              স্টক শেষ হয়ে গেছে
            </h1>
            <p className="mt-3 text-zinc-400">
              প্রোডাক্টটি বর্তমানে স্টকে নেই। শীঘ্রই পুনরায় পাওয়া যাবে।
            </p>
          </div>
        </div>
      );
    }

    // Referrer cookie set — now redirect to the actual product view page
    redirect(`/products/${productId}`);
  } catch (error) {
    console.error("Product referral error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-4 text-2xl font-bold text-zinc-50">
            কিছু একটা সমস্যা হয়েছে
          </h1>
          <p className="mt-3 text-zinc-400">দয়া করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }
}
