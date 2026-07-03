/**
 * Cron job endpoint: GET /api/cron/release-commission
 *
 * Finds all Orders where:
 *   - commissionStatus === "held"
 *   - escrowReleaseDate <= now  (return window has expired)
 *
 * For each mature order it:
 *   1. Moves the promoter's 80% share from holdBalance → availableBalance
 *      and adds it to totalEarned.
 *   2. Marks the order's commissionStatus as "released".
 *
 * Security:
 *   The caller must supply the correct bearer token via the Authorization header.
 *   Set CRON_SECRET in .env.local and configure your scheduler (Vercel Cron,
 *   GitHub Actions, etc.) to send:  Authorization: Bearer <CRON_SECRET>
 *
 * Recommended schedule: every hour (or at least once per day).
 */

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Order, Promoter } from "@/models";

const PROMOTER_SHARE = 0.8; // must match the value used in the delivery route

export async function GET(request: NextRequest) {
  // ── Bearer token guard ──────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET env variable is not set.");
    return NextResponse.json(
      { error: "সার্ভার কনফিগারেশন সমস্যা।" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "অননুমোদিত অনুরোধ।" },
      { status: 401 }
    );
  }

  // ── DB work ─────────────────────────────────────────────────────────────
  await dbConnect();

  const now = new Date();

  // Fetch all held commissions whose return window has expired
  const matureOrders = await Order.find({
    commissionStatus:  "held",
    escrowReleaseDate: { $lte: now },
  }).lean();

  let releasedCount = 0;
  let skippedCount  = 0;
  const errors: string[] = [];

  for (const order of matureOrders) {
    try {
      const totalCommission = order.commissionAmount ?? 0;
      const promoterShare   = totalCommission * PROMOTER_SHARE;

      if (order.promoterId && promoterShare > 0) {
        const promoter = await Promoter.findById(order.promoterId);
        if (promoter) {
          // Release: holdBalance → availableBalance + totalEarned
          promoter.holdBalance      = Math.max(0, promoter.holdBalance - promoterShare);
          promoter.availableBalance += promoterShare;
          promoter.totalEarned      += promoterShare;
          await promoter.save();
        } else {
          // Promoter deleted — mark released anyway to avoid re-processing
          skippedCount++;
        }
      }

      // Mark order as released regardless of whether a promoter was found
      await Order.updateOne(
        { _id: order._id },
        { $set: { commissionStatus: "released" } }
      );

      releasedCount++;
    } catch (err) {
      errors.push(`Order ${String(order._id)}: ${String(err)}`);
    }
  }

  return NextResponse.json(
    {
      message:
        releasedCount > 0
          ? `আলহামদুলিল্লাহ, ${releasedCount}টি কমিশন সফলভাবে মুক্ত করা হয়েছে।`
          : "কোনো মেয়াদোত্তীর্ণ কমিশন পাওয়া যায়নি।",
      releasedCount,
      skippedCount,
      totalProcessed: matureOrders.length,
      errors: errors.length > 0 ? errors : undefined,
      ranAt: now.toISOString(),
    },
    { status: 200 }
  );
}
