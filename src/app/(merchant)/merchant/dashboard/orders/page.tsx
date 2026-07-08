"use client";

import { useState, useEffect } from "react";
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

type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  items: Array<{
    productId: { title: string } | string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/merchant/orders");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "অর্ডার লোড করতে সমস্যা হয়েছে");
          return;
        }

        setOrders(data.orders || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/merchant/orders`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

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
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section>
        <p className="text-sm font-semibold text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          অর্ডার ম্যানেজমেন্ট
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          আপনার সকল অর্ডার দেখুন এবং স্ট্যাটাস আপডেট করুন
        </p>
      </section>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filter === status
                ? "border-emerald-700 bg-emerald-950/40 text-emerald-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            {status === "all" ? "সব" : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="h-6 w-1/3 rounded-lg bg-zinc-800" />
              <div className="mt-4 h-4 w-1/2 rounded-lg bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="text-center">
            <p className="text-lg font-medium text-zinc-50">কোন অর্ডার পাওয়া যায়নি</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-zinc-400">অর্ডার #{order._id.slice(-8)}</p>
                    <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">কাস্টমার</p>
                    <p className="mt-1 text-base font-medium text-zinc-50">{order.customerName}</p>
                    <p className="mt-1 text-sm text-zinc-400">{order.customerPhone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">ডেলিভারি ঠিকানা</p>
                    <p className="mt-1 text-sm text-zinc-50">{order.shippingAddress}</p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400">অর্ডার আইটেম</p>
                    <div className="mt-2 space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-zinc-50">
                          {typeof item.productId === "object" && item.productId.title
                            ? item.productId.title
                            : "প্রোডাক্ট"}{" "}
                          x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-sm text-zinc-400">মোট</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {formatBdt(order.totalAmount)}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleString("bn-BD")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {order.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order._id, "Confirmed")}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                      >
                        কনফার্ম করুন
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, "Cancelled")}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-red-700/50 bg-red-950/40 px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-red-950/60"
                      >
                        বাতিল করুন
                      </button>
                    </>
                  )}
                  {order.status === "Confirmed" && (
                    <button
                      onClick={() => updateOrderStatus(order._id, "Shipped")}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-purple-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
                    >
                      শিপ করুন
                    </button>
                  )}
                  {order.status === "Shipped" && (
                    <button
                      onClick={() => updateOrderStatus(order._id, "Delivered")}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                      ডেলিভারড মার্ক করুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
