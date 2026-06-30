import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/models";

interface PageProps {
  params: {
    productId: string;
  };
  searchParams: {
    ref?: string;
  };
}

export default async function ProductReferralPage({
  params,
  searchParams,
}: PageProps) {
  try {
    const { productId } = params;
    const { ref: promoterId } = searchParams;

    // Cookie Implementation: Set referrer cookie if promoter ID exists
    if (promoterId) {
      const cookieStore = await cookies();
      cookieStore.set("inshirah_referrer", promoterId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    // Database connection
    await dbConnect();

    // Fetch product and validate
    const product = await Product.findById(productId);

    // Check if product exists
    if (!product) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-50">
              দুঃখিত, এই প্রোডাক্টটি পাওয়া যায়নি
            </h1>
            <p className="mt-4 text-zinc-400">
              আপনি যে প্রোডাক্টটি খুঁজছেন তা বর্তমানে উপলব্ধ নেই।
            </p>
          </div>
        </div>
      );
    }

    // Check if product is active (has stock)
    if (product.status !== "active" || product.stockQuantity < 1) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-50">
              দুঃখিত, এই প্রোডাক্টটি বর্তমানে স্টকে নেই
            </h1>
            <p className="mt-4 text-zinc-400">
              প্রোডাক্টটি বর্তমানে স্টকে নেই অথবা অফলাইনে আছে।
            </p>
          </div>
        </div>
      );
    }

    // Redirect to actual product page if everything is valid
    redirect(`/products/${productId}`);
  } catch (error) {
    console.error("Product referral error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-50">
            কিছু একটা সমস্যা হয়েছে
          </h1>
          <p className="mt-4 text-zinc-400">
            দয়া করে পরে আবার চেষ্টা করুন।
          </p>
        </div>
      </div>
    );
  }
}
