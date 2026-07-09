"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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

interface AdminStats {
  totalPromoters: number;
  totalMerchants: number;
  totalProducts: number;
  totalOrders: number;
  pendingPayoutsCount: number;
  totalPlatformRevenue: number;
}

interface PopulatedPromoter {
  _id: string;
  fullName: string;
  email: string;
  whatsapp: string;
}

interface PendingPayout {
  _id: string;
  promoterId: PopulatedPromoter;
  amount: number;
  paymentMethod: "bKash" | "Nagad" | "Bank";
  accountDetails: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

type ActionState = Record<string, "loading" | "done" | "error">;

// ── Sub-components ────────────────────────────────────────────────────────────

type Accent = "emerald" | "amber" | "sky" | "violet" | "rose";

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
    rose: "from-rose-500/15 to-transparent",
  };
  const texts: Record<Accent, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    violet: "text-violet-400",
    rose: "text-rose-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${gradients[accent]}`}
      />
      <p className="relative text-sm font-medium text-zinc-400">{label}</p>
      {loading ? (
        <div className="relative mt-3 h-8 w-28 animate-pulse rounded-lg bg-zinc-800" />
      ) : (
        <p className={`relative mt-3 text-3xl font-bold tracking-tight ${texts[accent]}`}>
          {value}
        </p>
      )}
    </div>
  );
}

const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
  bKash: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  Nagad: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  Bank: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};

// ── Page ──────────────────────────────────────────────────────────────────────

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<ActionState>({});
  const [actionMessages, setActionMessages] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে");
        return;
      }
      setStats(data.stats);
      setPendingPayouts(data.pendingPayouts ?? []);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayoutAction = async (
    requestId: string,
    action: "Approve" | "Reject"
  ) => {
    setActionStates((prev) => ({ ...prev, [requestId]: "loading" }));
    setActionMessages((prev) => ({ ...prev, [requestId]: "" }));

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        setActionStates((prev) => ({ ...prev, [requestId]: "done" }));
        setActionMessages((prev) => ({
          ...prev,
          [requestId]: data.message ?? "সম্পন্ন হয়েছে।",
        }));
        // Remove from list after a short delay
        setTimeout(() => {
          setPendingPayouts((prev) => prev.filter((p) => p._id !== requestId));
        }, 1800);
      } else {
        setActionStates((prev) => ({ ...prev, [requestId]: "error" }));
        setActionMessages((prev) => ({
          ...prev,
          [requestId]: data.error ?? "সমস্যা হয়েছে।",
        }));
      }
    } catch {
      setActionStates((prev) => ({ ...prev, [requestId]: "error" }));
      setActionMessages((prev) => ({
        ...prev,
        [requestId]: "নেটওয়ার্ক সমস্যা হয়েছে।",
      }));
    }
  };

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      {/* ── Header ── */}
      <section>
        <p className="text-sm font-semibold text-emerald-400">সুপার অ্যাডমিন প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          প্ল্যাটফর্ম ওভারভিউ
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          ইনশিরাহ প্ল্যাটফর্মের সামগ্রিক পরিস্থিতি, পেন্ডিং পেআউট এবং ব্যবহারকারীর
          তথ্য এখান থেকে পরিচালনা করুন।
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </section>

      {/* ── Platform stats ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="মোট প্রমোটার"
          value={stats?.totalPromoters ?? 0}
          accent="emerald"
          loading={isLoading}
        />
        <StatCard
          label="মোট মার্চেন্ট"
          value={stats?.totalMerchants ?? 0}
          accent="sky"
          loading={isLoading}
        />
        <StatCard
          label="সক্রিয় পণ্য"
          value={stats?.totalProducts ?? 0}
          accent="violet"
          loading={isLoading}
        />
        <StatCard
          label="মোট অর্ডার"
          value={stats?.totalOrders ?? 0}
          accent="amber"
          loading={isLoading}
        />
        <StatCard
          label="পেন্ডিং পেআউট"
          value={stats?.pendingPayoutsCount ?? 0}
          accent="rose"
          loading={isLoading}
        />
        <StatCard
          label="প্ল্যাটফর্ম আয় (২০%)"
          value={isLoading ? "—" : formatBdt(stats?.totalPlatformRevenue ?? 0)}
          accent="emerald"
          loading={isLoading}
        />
      </section>

      {/* ── Pending payouts table ── */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              পেন্ডিং উত্তোলন অনুরোধ
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              অনুমোদন বা বাতিল করতে নিচের বোতামগুলো ব্যবহার করুন
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-700 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            রিফ্রেশ
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
            ))}
          </div>
        ) : pendingPayouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <svg className="h-16 w-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-zinc-400">
              সমস্ত পেআউট প্রক্রিয়া সম্পন্ন হয়েছে
            </p>
            <p className="text-xs text-zinc-600">কোনো অপেক্ষমান অনুরোধ নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {pendingPayouts.map((payout) => {
              const state = actionStates[payout._id];
              const message = actionMessages[payout._id];
              const promoter = payout.promoterId;

              return (
                <div key={payout._id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Promoter info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-zinc-50">
                          {promoter?.fullName ?? "অজ্ঞাত"}
                        </span>
                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          প্রমোটার
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {promoter?.email} · {promoter?.whatsapp}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="text-lg font-bold text-emerald-400">
                          {formatBdt(payout.amount)}
                        </span>
                        <span className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                          {PAYMENT_METHOD_ICONS[payout.paymentMethod] ?? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}{" "}
                          {payout.paymentMethod}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {payout.accountDetails}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">
                        {new Date(payout.requestedAt).toLocaleString("bn-BD")}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {state === "done" || state === "error" ? (
                        <p
                          className={`text-sm font-medium ${
                            state === "done" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {message}
                        </p>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={state === "loading"}
                            onClick={() =>
                              handlePayoutAction(payout._id, "Approve")
                            }
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {state === "loading" ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
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
                            ) : (
                              "✓ অনুমোদন"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={state === "loading"}
                            onClick={() =>
                              handlePayoutAction(payout._id, "Reject")
                            }
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-800/50 bg-red-950/30 px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ✕ বাতিল
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-zinc-400">লোড হচ্ছে...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
