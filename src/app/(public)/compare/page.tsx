"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type Product = {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  commissionPercentage: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComparison = () => {
      const comparison = JSON.parse(
        localStorage.getItem("inshirah_compare") || "[]"
      );
      setProducts(comparison);
      setIsLoading(false);
    };

    loadComparison();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = () => loadComparison();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromComparison = (productId: string) => {
    const updated = products.filter((p) => p._id !== productId);
    setProducts(updated);
    localStorage.setItem("inshirah_compare", JSON.stringify(updated));
  };

  const clearComparison = () => {
    setProducts([]);
    localStorage.removeItem("inshirah_compare");
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

  if (products.length === 0) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-50">
              তুলনা তালিকা খালি
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              প্রোডাক্ট যোগ করে তুলনা করুন
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50">প্রোডাক্ট তুলনা</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {products.length} টি প্রোডাক্ট তুলনা করা হচ্ছে
            </p>
          </div>
          <button
            onClick={clearComparison}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-red-700 hover:text-red-400"
          >
            সব সরান
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-4 text-left text-sm font-semibold text-zinc-400">
                  বৈশিষ্ট্য
                </th>
                {products.map((product) => (
                  <th key={product._id} className="px-4 py-4 text-center">
                    <div className="relative aspect-square w-32 mx-auto mb-3 overflow-hidden rounded-lg border border-zinc-800">
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
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/products/${product._id}`}
                      className="text-sm font-semibold text-zinc-50 hover:text-emerald-400 line-clamp-2"
                    >
                      {product.title}
                    </Link>
                    <button
                      onClick={() => removeFromComparison(product._id)}
                      className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-red-700 hover:text-red-400"
                    >
                      সরান
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800">
                <td className="py-4 text-sm font-medium text-zinc-400">দাম</td>
                {products.map((product) => (
                  <td key={product._id} className="px-4 py-4 text-center">
                    <p className="text-lg font-bold text-emerald-400">
                      {formatBdt(product.price)}
                    </p>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 text-sm font-medium text-zinc-400">ক্যাটাগরি</td>
                {products.map((product) => (
                  <td key={product._id} className="px-4 py-4 text-center">
                    <p className="text-sm text-zinc-50">{product.category}</p>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 text-sm font-medium text-zinc-400">স্টক</td>
                {products.map((product) => (
                  <td key={product._id} className="px-4 py-4 text-center">
                    <p className="text-sm text-zinc-50">
                      {product.stockQuantity > 0
                        ? `${product.stockQuantity} পিস`
                        : "স্টক নেই"}
                    </p>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 text-sm font-medium text-zinc-400">
                  প্রমোটার কমিশন
                </td>
                {products.map((product) => (
                  <td key={product._id} className="px-4 py-4 text-center">
                    <p className="text-sm text-amber-400">
                      {product.commissionPercentage}%
                    </p>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4 text-sm font-medium text-zinc-400">
                  বিবরণ
                </td>
                {products.map((product) => (
                  <td key={product._id} className="px-4 py-4 text-center">
                    <p className="text-sm text-zinc-400 line-clamp-4">
                      {product.description}
                    </p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
          >
            আরও প্রোডাক্ট যোগ করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
