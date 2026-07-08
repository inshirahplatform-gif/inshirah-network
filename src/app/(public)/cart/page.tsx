"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type CartItem = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stockQuantity: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem("inshirah_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stockQuantity) }
          : item
      );
      localStorage.setItem("inshirah_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      localStorage.setItem("inshirah_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            আপনার কার্ট
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            {totalItems} টি পণ্য নির্বাচিত
          </p>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
            <svg
              className="h-16 w-16 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-zinc-50">
              কার্ট খালি
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              প্রোডাক্ট যোগ করতে মার্কেটপ্লেসে যান
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-950">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        <span className="text-3xl">🛍️</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-base font-semibold text-zinc-50 hover:text-emerald-400"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-lg font-bold text-emerald-400">
                      {formatBdt(item.price)}
                    </p>

                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-zinc-50">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stockQuantity}
                          className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold text-zinc-50">সারসংক্ষেপ</h2>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">সাবটোটাল</span>
                  <span className="font-medium text-zinc-50">
                    {formatBdt(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">ডেলিভারি চার্জ</span>
                  <span className="font-medium text-emerald-400">ফ্রি</span>
                </div>
                <div className="border-t border-zinc-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-zinc-50">
                      মোট
                    </span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatBdt(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                চেকআউট করুন
              </Link>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-zinc-400 hover:text-zinc-300"
              >
                আরও প্রোডাক্ট যোগ করুন
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
