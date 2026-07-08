"use client";

import { useState } from "react";
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

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("অর্ডার আইডি দিন");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "অর্ডার পাওয়া যায়নি");
        return;
      }

      setOrderData(data.order);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/15 text-amber-400 border-amber-500/50";
      case "Confirmed":
        return "bg-blue-500/15 text-blue-400 border-blue-500/50";
      case "Shipped":
        return "bg-purple-500/15 text-purple-400 border-purple-500/50";
      case "Delivered":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/50";
      case "Cancelled":
        return "bg-red-500/15 text-red-400 border-red-500/50";
      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "পেন্ডিং";
      case "Confirmed":
        return "কনফার্মড";
      case "Shipped":
        return "শিপড";
      case "Delivered":
        return "ডেলিভারড";
      case "Cancelled":
        return "বাতিল";
      default:
        return status;
    }
  };

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            অর্ডার ট্র্যাক করুন
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            আপনার অর্ডার আইডি দিয়ে অর্ডারের স্ট্যাটাস দেখুন
          </p>
        </section>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="অর্ডার আইডি লিখুন..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:border-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "খুঁজুন"
              )}
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">অর্ডার আইডি</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-50">{orderData._id}</p>
                </div>
                <div className={`rounded-xl border px-4 py-2 text-sm font-semibold ${getStatusColor(orderData.status)}`}>
                  {getStatusText(orderData.status)}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">অর্ডার তারিখ</p>
                  <p className="mt-1 text-base font-medium text-zinc-50">
                    {new Date(orderData.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">মোট পরিমাণ</p>
                  <p className="mt-1 text-base font-bold text-emerald-400">
                    {formatBdt(orderData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-50">কাস্টমার তথ্য</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-zinc-400">নাম</p>
                  <p className="mt-1 text-base font-medium text-zinc-50">{orderData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">ফোন নম্বর</p>
                  <p className="mt-1 text-base font-medium text-zinc-50">{orderData.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">ডেলিভারি ঠিকানা</p>
                  <p className="mt-1 text-base font-medium text-zinc-50">{orderData.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-50">অর্ডার আইটেম</h2>
              <div className="mt-4 space-y-4">
                {orderData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-base font-medium text-zinc-50">
                        {item.productId?.title || `প্রোডাক্ট #${item.productId}`}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">পরিমাণ: {item.quantity}</p>
                    </div>
                    <p className="text-base font-semibold text-zinc-50">
                      {formatBdt(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-zinc-50">অর্ডার টাইমলাইন</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">অর্ডার প্লেসড</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(orderData.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>
                </div>
                {orderData.status !== "Pending" && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-50">অর্ডার কনফার্মড</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        মার্চেন্ট অর্ডার গ্রহণ করেছেন
                      </p>
                    </div>
                  </div>
                )}
                {orderData.status === "Shipped" && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-50">শিপড</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        অর্ডার ডেলিভারির পথে
                      </p>
                    </div>
                  </div>
                )}
                {orderData.status === "Delivered" && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-50">ডেলিভারড</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        অর্ডার সফলভাবে ডেলিভার করা হয়েছে
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
