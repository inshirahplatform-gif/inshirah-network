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
  commissionPercentage: number;
  stockQuantity: number;
  imageUrl?: string;
  category?: string;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "প্রোডাক্ট লোড করতে সমস্যা হয়েছে");
          return;
        }

        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))));

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            মার্কেটপ্লেস
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            শতভাগ হালাল ও শারীয়াহ-সম্মত প্রোডাক্টের সমাহার
          </p>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট খুঁজুন..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pl-12 text-sm text-zinc-50 outline-none transition-colors focus-visible:border-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              />
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-zinc-400">
                {filteredProducts.length} টি প্রোডাক্ট পাওয়া গেছে
              </p>
            )}
          </div>
        </section>

        <div className="flex gap-8">
          {/* Sidebar Categories */}
          {categories.length > 0 && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <h2 className="text-sm font-semibold text-zinc-50 mb-4">ক্যাটাগরি</h2>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedCategory === "all"
                        ? "bg-emerald-950/40 text-emerald-400 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    সব প্রোডাক্ট
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-emerald-950/40 text-emerald-400 font-medium"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Category Filter */}
            {categories.length > 0 && (
              <div className="mb-6 lg:hidden">
                <p className="text-sm font-medium text-zinc-400 mb-3">ক্যাটাগরি</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "border-emerald-700 bg-emerald-950/40 text-emerald-400"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    সব
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "border-emerald-700 bg-emerald-950/40 text-emerald-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-8 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="h-48 w-full rounded-xl bg-zinc-800" />
                    <div className="mt-4 h-6 w-3/4 rounded-lg bg-zinc-800" />
                    <div className="mt-2 h-4 w-1/2 rounded-lg bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <div className="text-center">
                  <p className="text-lg font-medium text-zinc-50">
                    কোন প্রোডাক্ট পাওয়া যায়নি
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    শীঘ্রই নতুন প্রোডাক্ট যুক্ত হবে
                  </p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <div className="text-center">
                  <p className="text-lg font-medium text-zinc-50">
                    কোন প্রোডাক্ট পাওয়া যায়নি
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    অন্য কোনো সার্চ টার্ম চেষ্টা করুন
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-900/10"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-zinc-950">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          <svg
                            className="h-16 w-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Stock Badge */}
                      {product.stockQuantity < 5 && (
                        <div className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                          স্টক কম
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-base font-semibold text-zinc-50 group-hover:text-emerald-400">
                        {product.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-bold text-emerald-400">
                          {formatBdt(product.price)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {product.commissionPercentage}% কমিশন
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-zinc-400">
                        স্টক: {product.stockQuantity} পিস
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
