"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type Deal = {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  imageUrl?: string;
  validUntil: string;
  minPurchase?: number;
  maxDiscount?: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/deals");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "ডিল লোড করতে সমস্যা হয়েছে");
          return;
        }

        setDeals(data.deals || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            ডিল এবং ডিসকাউন্ট
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            শরিয়াহ-সম্মত সুদ-মুক্ত অফার এবং ডিসকাউন্ট
          </p>
        </div>

        {/* Shariah Compliance Banner */}
        <div className="mb-8 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-950/50">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                শরিয়াহ-সম্মত ডিসকাউন্ট
              </h2>
              <p className="text-sm text-zinc-400">
                আমাদের সব ডিসকাউন্ট সম্পূর্ণ সুদ-মুক্ত। মুরাবাহা বা কস্ট-প্লাস মূল্যে ডিসকাউন্ট দেওয়া হয়, কোনো লুকানো খরচ নেই।
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {deals.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="text-center">
              <p className="text-lg font-medium text-zinc-50">
                বর্তমানে কোন ডিল নেই
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                শীঘ্রই নতুন ডিল আসবে
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <div
                key={deal._id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-900/10"
              >
                {/* Deal Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-zinc-950">
                  {deal.imageUrl ? (
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-900/50 to-zinc-900">
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute right-4 top-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                    {deal.discountPercentage}% ছাড়
                  </div>

                  {/* Valid Until Badge */}
                  <div className="absolute left-4 bottom-4 rounded-lg bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
                    {new Date(deal.validUntil).toLocaleDateString("bn-BD", {
                      month: "short",
                      day: "numeric",
                    })} পর্যন্ত
                  </div>
                </div>

                {/* Deal Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-zinc-50">
                    {deal.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                    {deal.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-lg font-bold text-emerald-400">
                      {formatBdt(deal.discountedPrice)}
                    </p>
                    <p className="text-sm text-zinc-500 line-through">
                      {formatBdt(deal.originalPrice)}
                    </p>
                  </div>

                  {deal.minPurchase && (
                    <p className="mt-2 text-xs text-zinc-500">
                      সর্বনিম্ন কেনাকাটা: {formatBdt(deal.minPurchase)}
                    </p>
                  )}

                  {deal.maxDiscount && (
                    <p className="mt-1 text-xs text-zinc-500">
                      সর্বোচ্চ ডিসকাউন্ট: {formatBdt(deal.maxDiscount)}
                    </p>
                  )}

                  <Link
                    href="/products"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    ডিল নিন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
