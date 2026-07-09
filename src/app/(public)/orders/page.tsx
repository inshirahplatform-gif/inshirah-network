"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";
import { useRouter } from "next/navigation";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: string;
  createdAt: string;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusLabel(status: Order["status"]) {
  const labels = {
    Pending: "অপেক্ষমান",
    Shipped: "পাঠানো হয়েছে",
    Delivered: "ডেলিভারড",
    Cancelled: "বাতিল",
  };
  return labels[status];
}

function getStatusColor(status: Order["status"]) {
  const colors = {
    Pending: "bg-yellow-950/50 text-yellow-400",
    Shipped: "bg-purple-950/50 text-purple-400",
    Delivered: "bg-emerald-950/50 text-emerald-400",
    Cancelled: "bg-red-950/50 text-red-400",
  };
  return colors[status];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "অর্ডার লোড করতে সমস্যা হয়েছে");
          return;
        }

        setOrders(data.orders || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const reorderItems = (items: OrderItem[]) => {
    const existingCart = JSON.parse(localStorage.getItem("inshirah_cart") || "[]");
    const updatedCart = [...existingCart];

    items.forEach((item) => {
      const cartItem = {
        productId: item.productId,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        stockQuantity: 0, // Will be validated at checkout
      };
      updatedCart.push(cartItem);
    });

    localStorage.setItem("inshirah_cart", JSON.stringify(updatedCart));
    router.push("/cart");
  };

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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-50">আমার অর্ডার</h1>
          <p className="mt-2 text-sm text-zinc-400">
            আপনার সব অর্ডারের ইতিহাস দেখুন
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-50">
              কোনো অর্ডার নেই
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              আপনি এখনো কোনো অর্ডার করেননি
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-zinc-400">
                        অর্ডার #{order._id.slice(-8)}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatBdt(order.totalAmount)}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-800">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-zinc-800">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-zinc-50">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">
                          {formatBdt(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-zinc-50">
                        {formatBdt(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                  <div className="text-xs text-zinc-500">
                    <p>ডেলিভারি ঠিকানা:</p>
                    <p className="mt-1 text-zinc-400">{order.shippingAddress}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-emerald-700 hover:text-emerald-400"
                    >
                      ট্র্যাক করুন
                    </Link>
                    {order.status === "Delivered" && (
                      <button
                        onClick={() => reorderItems(order.items)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-emerald-700 hover:text-emerald-400"
                      >
                        আবার অর্ডার করুন
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
