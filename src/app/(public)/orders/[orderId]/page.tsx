"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

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
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  courierTrackingId: string;
  courierStatus: string;
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

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "অর্ডার লোড করতে সমস্যা হয়েছে");
          return;
        }

        setOrder(data.order);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error || "অর্ডার পাওয়া যায়নি"}
          </div>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
          >
            অর্ডার তালিকায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const trackingSteps = [
    { key: "Pending", label: "অর্ডার নেওয়া হয়েছে" },
    { key: "Shipped", label: "কুরিয়ারে হস্তান্তর" },
    { key: "Delivered", label: "ডেলিভারড" },
  ];

  const currentStepIndex = trackingSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
        >
          ← অর্ডার তালিকায় ফিরে যান
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-zinc-50">অর্ডার ট্র্যাকিং</h1>
          <p className="mt-2 text-sm text-zinc-400">
            অর্ডার #{order._id.slice(-8)}
          </p>
        </div>

        {/* Status Badge */}
        <div className="mt-6">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Tracking Timeline */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-6">
            ডেলিভারি স্ট্যাটাস
          </h2>
          <div className="relative">
            {trackingSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isCancelled = order.status === "Cancelled";

              return (
                <div key={step.key} className="relative pb-8 last:pb-0">
                  {index !== trackingSteps.length - 1 && (
                    <div
                      className={`absolute left-3 top-8 h-full w-0.5 ${
                        isCompleted && !isCancelled
                          ? "bg-emerald-600"
                          : "bg-zinc-800"
                      }`}
                    />
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                        isCompleted && !isCancelled
                          ? "bg-emerald-600"
                          : "bg-zinc-800"
                      }`}
                    >
                      {isCompleted && !isCancelled ? (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent && !isCancelled
                            ? "text-emerald-400"
                            : isCompleted && !isCancelled
                            ? "text-zinc-50"
                            : "text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && !isCancelled && (
                        <p className="mt-1 text-xs text-zinc-400">
                          বর্তমান অবস্থা
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Tracking */}
        {order.courierTrackingId && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-50 mb-4">
              কুরিয়ার ট্র্যাকিং
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">ট্র্যাকিং নম্বর</span>
                <span className="text-sm font-medium text-zinc-50">
                  {order.courierTrackingId}
                </span>
              </div>
              {order.courierStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">কুরিয়ার স্ট্যাটাস</span>
                  <span className="text-sm font-medium text-zinc-50">
                    {order.courierStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-4">
            অর্ডার বিবরণ
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">অর্ডার তারিখ</span>
              <span className="text-sm text-zinc-50">
                {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">গ্রাহকের নাম</span>
              <span className="text-sm text-zinc-50">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">ফোন নম্বর</span>
              <span className="text-sm text-zinc-50">{order.customerPhone}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-400">ডেলিভারি ঠিকানা</span>
              <span className="text-sm text-zinc-50 text-right max-w-xs">
                {order.shippingAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-4">
            অর্ডারকৃত প্রোডাক্ট
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-800">
                      <span className="text-2xl">📦</span>
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
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-50">
                মোট পরিমাণ
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatBdt(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Installment Option */}
        {order.status === "Delivered" && (
          <div className="mt-6 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-4">
              ইনস্টলমেন্ট প্ল্যান তৈরি করুন
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              শরিয়াহ-সম্মত সুদ-মুক্ত ইনস্টলমেন্ট প্ল্যানের মাধ্যমে পেমেন্ট করুন
            </p>
            <Link
              href={`/installments/create?orderId=${order._id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              ইনস্টলমেন্ট প্ল্যান তৈরি করুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
