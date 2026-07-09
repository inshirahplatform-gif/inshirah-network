"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type Merchant = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  description?: string;
  averageRating?: number;
  totalReviews?: number;
  totalProducts?: number;
  totalOrders?: number;
  joinedDate: string;
};

type Product = {
  _id: string;
  title: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  averageRating?: number;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MerchantProfilePage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        const { merchantId } = await params;

        const [merchantRes, productsRes] = await Promise.all([
          fetch(`/api/merchants/${merchantId}`),
          fetch(`/api/merchants/${merchantId}/products`),
        ]);

        if (!merchantRes.ok) {
          setError("মার্চেন্ট পাওয়া যায়নি");
          return;
        }

        const merchantData = await merchantRes.json();
        const productsData = await productsRes.json();

        setMerchant(merchantData.merchant);
        setProducts(productsData.products || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantData();
  }, [params]);

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="flex items-center justify-center py-16">
          <p className="text-red-400">{error || "মার্চেন্ট পাওয়া যায়নি"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Merchant Header */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-950/30 text-4xl">
              {merchant.businessName.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">
                {merchant.businessName}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                যোগদান: {new Date(merchant.joinedDate).toLocaleDateString("bn-BD")}
              </p>

              {merchant.description && (
                <p className="mt-3 text-sm text-zinc-300">{merchant.description}</p>
              )}

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= Math.round(merchant.averageRating || 0)
                            ? "text-amber-400"
                            : "text-zinc-700"
                        }`}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-zinc-400">
                    ({merchant.totalReviews || 0} রিভিউ)
                  </span>
                </div>

                <div className="text-sm text-zinc-400">
                  {merchant.totalProducts || 0} প্রোডাক্ট
                </div>
                <div className="text-sm text-zinc-400">
                  {merchant.totalOrders || 0} অর্ডার
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-bold text-zinc-50 mb-6">
            মার্চেন্টের প্রোডাক্ট
          </h2>

          {products.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <p className="text-zinc-400">কোন প্রোডাক্ট নেই</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:border-emerald-700/50"
                >
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
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-50 group-hover:text-emerald-400">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-lg font-bold text-emerald-400">
                      {formatBdt(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
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
  );
}
