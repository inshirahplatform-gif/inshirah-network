"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const MIN_WITHDRAWAL = 500;

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "emerald" | "amber" | "sky";
  loading?: boolean;
};

function StatCard({ label, value, icon, accent = "emerald", loading }: StatCardProps) {
  const accentClasses = {
    emerald: "border-emerald-200/50 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30",
    amber: "border-amber-200/50 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30",
    sky: "border-sky-200/50 bg-sky-50 dark:border-sky-800/50 dark:bg-sky-950/30",
  };
  
  const iconClasses = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    sky: "text-sky-600 dark:text-sky-400",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${accentClasses[accent]} p-6 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : (
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {value}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClasses[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

type PromoterData = {
  fullName: string;
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
};

export default function PromoterDashboardPage() {
  const [promoter, setPromoter] = useState<PromoterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/promoter/profile");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "প্রোফাইল লোড করতে সমস্যা হয়েছে");
          return;
        }

        setPromoter({
          fullName: data.promoter.fullName,
          totalEarned: data.promoter.totalEarned ?? 0,
          pendingBalance: data.promoter.pendingBalance ?? 0,
          availableBalance: data.promoter.availableBalance ?? 0,
        });
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const canWithdraw =
    !isLoading &&
    promoter !== null &&
    promoter.availableBalance >= MIN_WITHDRAWAL;

  const handleWithdraw = async () => {
    if (!canWithdraw || !promoter) return;

    setIsWithdrawing(true);
    try {
      // Placeholder: a real implementation would open a withdrawal modal here.
      // For now we just alert — the POST /api/promoter/withdraw requires
      // paymentMethod and accountDetails which need a form/modal.
      alert(
        "উত্তোলন ফিচারটি শীঘ্রই আসছে। আপনার উপলব্ধ ব্যালেন্স: " +
          formatBdt(promoter.availableBalance)
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm dark:border-zinc-800 dark:from-emerald-950/30 dark:to-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">প্রমোটার প্যানেল</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {isLoading ? (
                <span className="inline-block h-9 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              ) : (
                <>স্বাগতম, {promoter?.fullName ?? "প্রমোটার"}</>
              )}
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          আপনার আয়, ব্যালেন্স ও উত্তোলনের তথ্য এক জায়গায় দেখুন এবং নতুন
          প্রোডাক্ট খুঁজে প্রচার শুরু করুন।
        </p>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="মোট আয়"
          value={formatBdt(promoter?.totalEarned ?? 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accent="emerald"
          loading={isLoading}
        />
        <StatCard
          label="পেন্ডিং ব্যালেন্স"
          value={formatBdt(promoter?.pendingBalance ?? 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accent="amber"
          loading={isLoading}
        />
        <StatCard
          label="উত্তোলনযোগ্য ব্যালেন্স"
          value={formatBdt(promoter?.availableBalance ?? 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          accent="sky"
          loading={isLoading}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">উত্তোলন (Payout)</p>
              <h3 className="mt-0.5 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                উত্তোলনযোগ্য ব্যালেন্স
              </h3>
            </div>
          </div>
          {isLoading ? (
            <div className="mt-6 h-12 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : (
            <p className="mt-6 text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatBdt(promoter?.availableBalance ?? 0)}
            </p>
          )}
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            যাচাইকৃত আয় থেকে বর্তমানে উত্তোলনের জন্য প্রস্তুত অর্থের পরিমাণ।
          </p>

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!canWithdraw || isWithdrawing}
            className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${
              canWithdraw && !isWithdrawing
                ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md focus-visible:outline-emerald-500"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 focus-visible:outline-zinc-600"
            }`}
          >
            {isWithdrawing ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                প্রসেস হচ্ছে…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                টাকা উত্তোলন করুন
              </>
            )}
          </button>

          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
            ন্যূনতম ৫০০ টাকা হলে উত্তোলন করা যাবে।
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">দ্রুত কাজ</p>
                <h3 className="mt-0.5 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                  নতুন প্রোডাক্ট খুঁজুন
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              মার্কেটপ্লেস থেকে হালাল ও অনুমোদিত প্রোডাক্ট বেছে নিয়ে আপনার
              অ্যাফিলিয়েট লিংক তৈরি করুন।
            </p>
          </div>

          <Link
            href="/promoter/marketplace"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 transition-all hover:border-emerald-700 hover:bg-emerald-50 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            প্রোডাক্ট খুঁজুন
          </Link>
        </div>
      </section>
    </div>
  );
}
