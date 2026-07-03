"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";

interface RecentOrder {
  _id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

interface MerchantStats {
  activeListings: number;
  pendingOrders: number;
  totalDelivered: number;
  totalRevenue: number;
  netRevenue: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

type Accent = "emerald" | "amber" | "sky" | "violet";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: Accent;
  loading?: boolean;
}

function StatCard({ label, value, accent = "emerald", loading }: StatCardProps) {
  const gradients: Record<Accent, string> = {
    emerald: "from-emerald-500/15 to-transparent",
    amber: "from-amber-500/15 to-transparent",
    sky: "from-sky-500/15 to-transparent",
    violet: "from-violet-500/15 to-transparent",
  };
  const texts: Record<Accent, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    violet: "text-violet-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${gradients[accent]}`}
      />
      <p className="relative text-sm font-medium text-zinc-400">{label}</p>
      {loading ? (
        <div className="relative mt-3 h-8 w-32 animate-pulse rounded-lg bg-zinc-800" />
      ) : (
        <p className={`relative mt-3 text-3xl font-bold tracking-tight ${texts[accent]}`}>
          {value}
        </p>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "অপেক্ষমান",
  Shipped: "পাঠানো হয়েছে",
  Delivered: "ডেলিভার্ড",
  Cancelled: "বাতিল",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "border-amber-800/50 bg-amber-950/30 text-amber-400",
  Shipped: "border-sky-800/50 bg-sky-950/30 text-sky-400",
  Delivered: "border-emerald-800/50 bg-emerald-950/30 text-emerald-400",
  Cancelled: "border-red-800/50 bg-red-950/30 text-red-400",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/merchant/stats");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে");
          return;
        }
        setStats(data.stats);
        setRecentOrders(data.recentOrders ?? []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      {/* ── Header ── */}
      <section>
        <p className="text-sm font-semibold text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          স্বাগতম, আপনার ড্যাশবোর্ড
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          আপনার পণ্য, অর্ডার ও বিক্রয়ের সম্পূর্ণ চিত্র এক জায়গায় দেখুন।
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </section>

      {/* ── Stats grid ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="সক্রিয় পণ্য"
          value={stats?.activeListings ?? 0}
          accent="emerald"
          loading={isLoading}
        />
        <StatCard
          label="অপেক্ষমান অর্ডার"
          value={stats?.pendingOrders ?? 0}
          accent="amber"
          loading={isLoading}
        />
        <StatCard
          label="মোট বিক্রয়"
          value={isLoading ? "—" : formatBdt(stats?.totalRevenue ?? 0)}
          accent="sky"
          loading={isLoading}
        />
        <StatCard
          label="নেট আয় (কমিশন বাদে)"
          value={isLoading ? "—" : formatBdt(stats?.netRevenue ?? 0)}
          accent="violet"
          loading={isLoading}
        />
      </section>

      {/* ── Quick actions + recent orders ── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Recent orders table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="text-base font-semibold text-zinc-50">
              সাম্প্রতিক অর্ডার
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-800" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="text-4xl">📋</span>
              <p className="text-sm text-zinc-500">এখনো কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-50">
                      {order.customerName}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-50">
                      {formatBdt(order.totalAmount)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-50">
              দ্রুত কাজ
            </h3>
            <div className="mt-5 space-y-3">
              <Link
                href="/merchant/dashboard/upload"
                className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-zinc-50 transition-colors hover:border-emerald-700 hover:bg-emerald-950/30"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700/20 text-emerald-400">
                  ＋
                </span>
                নতুন পণ্য যুক্ত করুন
              </Link>
            </div>
          </div>

          {/* Shariah reminder */}
          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              শারীয়াহ অনুস্মারক
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-200/70">
              শুধুমাত্র আপনার ফিজিক্যাল স্টকে বিদ্যমান পণ্য লিস্টিং করুন।
              স্টক শেষ হলে পণ্যটি স্বয়ংক্রিয়ভাবে লুকিয়ে যাবে।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
