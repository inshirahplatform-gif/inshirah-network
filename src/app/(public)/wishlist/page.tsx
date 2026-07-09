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

type Product = {
  _id: string;
  title: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "উইশলিস্ট লোড করতে সমস্যা হয়েছে");
          return;
        }

        setProducts(data.products || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch {
      // Silently fail
    }
  };

  const addToCart = (product: Product) => {
    const cartItem = {
      productId: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      stockQuantity: product.stockQuantity,
    };
    const existingCart = JSON.parse(localStorage.getItem("inshirah_cart") || "[]");
    const updatedCart = [...existingCart, cartItem];
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
          <h1 className="text-3xl font-bold text-zinc-50">আমার উইশলিস্ট</h1>
          <p className="mt-2 text-sm text-zinc-400">
            সংরক্ষিত প্রোডাক্টগুলো এখানে দেখুন
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-50">
              উইশলিস্ট খালি
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              আপনার পছন্দের প্রোডাক্টগুলো সেভ করুন
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <div className="relative aspect-square">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-800">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-50 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-lg font-bold text-emerald-400">
                    {formatBdt(product.price)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {product.stockQuantity > 0
                      ? `${product.stockQuantity} পিস স্টকে আছে`
                      : "স্টক শেষ"}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stockQuantity < 1}
                    className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      product.stockQuantity < 1
                        ? "pointer-events-none cursor-not-allowed bg-zinc-800 text-zinc-500"
                        : "bg-emerald-700 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {product.stockQuantity < 1 ? "স্টক নেই" : "কার্টে যোগ করুন"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
