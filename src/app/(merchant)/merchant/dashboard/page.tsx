"use client";

import { useState, useEffect, useCallback } from "react";
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

interface PendingOrder {
  _id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  courierTrackingId: string;
  courierStatus: string;
  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  createdAt: string;
}

interface RecentOrder {
  _id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  courierTrackingId: string;
  createdAt: string;
}

interface MerchantStats {
  activeListings: number;
  pendingOrders: number;
  totalDelivered: number;
  totalRevenue: number;
  netRevenue: number;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
type Accent = "emerald" | "amber" | "sky" | "violet";

function StatCard({ label, value, accent = "emerald", loading }: {
  label: string; value: string | number; accent?: Accent; loading?: boolean;
}) {
  const g: Record<Accent, string> = {
    emerald: "from-emerald-500/15 to-transparent",
    amber:   "from-amber-500/15 to-transparent",
    sky:     "from-sky-500/15 to-transparent",
    violet:  "from-violet-500/15 to-transparent",
  };
  const t: Record<Accent, string> = {
    emerald: "text-emerald-400",
    amber:   "text-amber-400",
    sky:     "text-sky-400",
    violet:  "text-violet-400",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${g[accent]}`} />
      <p className="relative text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      {loading
        ? <div className="relative mt-3 h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        : <p className={`relative mt-3 text-3xl font-bold tracking-tight ${t[accent]}`}>{value}</p>}
    </div>
  );
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  Pending:   "অপেক্ষমান",
  Shipped:   "শিপড",
  Delivered: "ডেলিভার্ড",
  Cancelled: "বাতিল",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending:   "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400",
  Shipped:   "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-400",
  Delivered: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400",
  Cancelled: "border-red-300 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400",
};

type Banner = { type: "success" | "error"; text: string } | null;

// ── Courier booking modal ─────────────────────────────────────────────────────
function CourierModal({
  order,
  onClose,
  onSuccess,
}: {
  order: PendingOrder;
  onClose: () => void;
  onSuccess: (trackingCode: string, orderId: string) => void;
}) {
  const [pickupName,    setPickupName]    = useState(order.pickupName    || "");
  const [pickupPhone,   setPickupPhone]   = useState(order.pickupPhone   || "");
  const [pickupAddress, setPickupAddress] = useState(order.pickupAddress || "");
  const [note,          setNote]          = useState("");
  const [isLoading,     setIsLoading]     = useState(false);
  const [banner,        setBanner]        = useState<Banner>(null);

  const handleBook = async () => {
    setBanner(null);
    if (!pickupName.trim() || !pickupPhone.trim() || !pickupAddress.trim()) {
      setBanner({ type: "error", text: "পিকআপের নাম, ফোন ও ঠিকানা পূরণ করুন।" });
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch("/api/merchant/orders/book-courier", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          pickupName:    pickupName.trim(),
          pickupPhone:   pickupPhone.trim(),
          pickupAddress: pickupAddress.trim(),
          note:          note.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanner({ type: "success", text: `${data.message} ট্র্যাকিং: ${data.trackingCode}` });
        setTimeout(() => { onSuccess(data.trackingCode, order._id); onClose(); }, 2000);
      } else {
        setBanner({ type: "error", text: data.error ?? "কুরিয়ার বুকিংয়ে সমস্যা হয়েছে।" });
      }
    } catch {
      setBanner({ type: "error", text: "নেটওয়ার্ক সমস্যা হয়েছে।" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">কুরিয়ারে বুক করুন</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          গ্রাহক: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.customerName}</span> — {formatBdt(order.totalAmount)} COD
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">পিকআপ ব্যক্তির নাম *</label>
            <input className={inputCls} value={pickupName} onChange={(e) => setPickupName(e.target.value)} placeholder="আপনার নাম বা দোকানের নাম" disabled={isLoading} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">পিকআপ ফোন নম্বর *</label>
            <input className={inputCls} value={pickupPhone} onChange={(e) => setPickupPhone(e.target.value)} placeholder="01XXXXXXXXX" disabled={isLoading} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">পিকআপ ঠিকানা *</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="বিস্তারিত ঠিকানা লিখুন" disabled={isLoading} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">নোট (ঐচ্ছিক)</label>
            <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="বিশেষ নির্দেশনা" disabled={isLoading} />
          </div>
        </div>

        {banner && (
          <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            banner.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300"
          }`} role="alert">
            <span className="shrink-0">{banner.type === "success" ? "✓" : "✕"}</span>
            <span>{banner.text}</span>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-300 bg-transparent py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            বাতিল
          </button>
          <button type="button" onClick={handleBook} disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading
              ? <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>বুকিং হচ্ছে…</>
              : "কুরিয়ারে বুক করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MerchantDashboardPage() {
  const [stats,         setStats]         = useState<MerchantStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentOrders,  setRecentOrders]  = useState<RecentOrder[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [bookingOrder,  setBookingOrder]  = useState<PendingOrder | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch("/api/merchant/stats");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "লোড করতে সমস্যা হয়েছে"); return; }
      setStats(data.stats);
      setPendingOrders(data.pendingOrders ?? []);
      setRecentOrders(data.recentOrders ?? []);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCourierSuccess = (trackingCode: string, orderId: string) => {
    setPendingOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, courierTrackingId: trackingCode, courierStatus: "in_review", status: "Shipped" }
          : o
      )
    );
  };

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>

      {/* Header */}
      <section>
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">স্বাগতম, আপনার ড্যাশবোর্ড</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          আপনার পণ্য, অর্ডার ও বিক্রয়ের সম্পূর্ণ চিত্র এক জায়গায় দেখুন।
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">{error}</p>
        )}
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="সক্রিয় পণ্য"          value={stats?.activeListings ?? 0}                             accent="emerald" loading={isLoading} />
        <StatCard label="অপেক্ষমান অর্ডার"      value={stats?.pendingOrders ?? 0}                              accent="amber"   loading={isLoading} />
        <StatCard label="মোট বিক্রয়"            value={isLoading ? "—" : formatBdt(stats?.totalRevenue ?? 0)} accent="sky"     loading={isLoading} />
        <StatCard label="নেট আয় (কমিশন বাদে)"  value={isLoading ? "—" : formatBdt(stats?.netRevenue ?? 0)}   accent="violet"  loading={isLoading} />
      </section>

      {/* ── Courier booking table ── */}
      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">পেন্ডিং / শিপড অর্ডার</h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">কুরিয়ারে বুক না করা অর্ডারে বোতামটি দেখাবে</p>
          </div>
          <button type="button" onClick={load} disabled={isLoading}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50">
            <svg className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            রিফ্রেশ
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />)}
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-4xl">📋</span>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">কোনো পেন্ডিং অর্ডার নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pendingOrders.map((order) => (
              <div key={order._id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{order.customerName}</p>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                    {order.customerPhone} · {order.shippingAddress}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatBdt(order.totalAmount)} COD
                  </p>
                  {order.courierTrackingId && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <span>📦</span>
                      <span className="font-mono font-semibold">{order.courierTrackingId}</span>
                      <span className="text-zinc-400">({order.courierStatus})</span>
                    </p>
                  )}
                </div>

                {!order.courierTrackingId ? (
                  <button
                    type="button"
                    onClick={() => setBookingOrder(order)}
                    className="shrink-0 inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    কুরিয়ারে বুক করুন
                  </button>
                ) : (
                  <span className="shrink-0 inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                    ✓ কুরিয়ার বুকড
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom strip: quick actions + recent orders */}
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent orders */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">সর্বশেষ ৫টি অর্ডার</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-6">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />)}</div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="text-3xl">📋</span>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">এখনো কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{order.customerName}</p>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                      {order.courierTrackingId && (
                        <span className="ml-2 font-mono text-emerald-600 dark:text-emerald-400">{order.courierTrackingId}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{formatBdt(order.totalAmount)}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + shariah reminder */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">দ্রুত কাজ</h3>
            <div className="mt-4 space-y-2">
              <Link href="/merchant/dashboard/upload"
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-700/20 dark:text-emerald-400">＋</span>
                নতুন পণ্য যুক্ত করুন
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-500">শারীয়াহ অনুস্মারক</p>
            <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200/70">
              শুধুমাত্র আপনার ফিজিক্যাল স্টকে বিদ্যমান পণ্য লিস্টিং করুন। স্টক শেষ হলে পণ্যটি স্বয়ংক্রিয়ভাবে লুকিয়ে যাবে।
            </p>
          </div>
        </div>
      </section>

      {/* Courier booking modal */}
      {bookingOrder && (
        <CourierModal
          order={bookingOrder}
          onClose={() => setBookingOrder(null)}
          onSuccess={handleCourierSuccess}
        />
      )}
    </div>
  );
}
