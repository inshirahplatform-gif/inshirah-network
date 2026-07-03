import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { Product } from "@/models";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "অনুগ্রহ করে লগ-ইন করুন" }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "সেশন মেয়াদ শেষ বা অবৈধ। পুনরায় লগ-ইন করুন।" },
        { status: 401 }
      );
    }

    if (session.role !== "merchant") {
      return NextResponse.json(
        { error: "শুধুমাত্র মার্চেন্ট পণ্য মুছতে পারবেন।" },
        { status: 403 }
      );
    }

    const { productId } = await params;

    await dbConnect();

    // ── Ownership check ───────────────────────────────────────────────────
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "পণ্যটি পাওয়া যায়নি" }, { status: 404 });
    }

    if (product.merchantId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "এই পণ্যটি আপনার নয়। মুছতে অনুমতি নেই।" },
        { status: 403 }
      );
    }

    // ── Cloudinary cleanup ────────────────────────────────────────────────
    // Only runs when a file was originally uploaded via Cloudinary
    if (product.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(product.cloudinaryPublicId);
      } catch (cloudErr) {
        // Log but don't abort — still delete the DB record
        console.error("Cloudinary delete error (non-fatal):", cloudErr);
      }
    }

    // ── DB delete ─────────────────────────────────────────────────────────
    await Product.deleteOne({ _id: productId });

    return NextResponse.json(
      {
        message:
          "পণ্যটি এবং এর সাথে যুক্ত ইমেজ ফাইলটি সফলভাবে প্ল্যাটফর্ম থেকে মুছে ফেলা হয়েছে।",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "পণ্য মুছতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
