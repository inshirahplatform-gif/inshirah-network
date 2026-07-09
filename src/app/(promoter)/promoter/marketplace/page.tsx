"use client";

import { useState, useEffect } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

interface Product {
  _id: string;
  title: string;
  price: number;
  commissionPercentage: number;
  stockQuantity: number;
  imageUrl: string;
}

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="aspect-[3/2] w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onGenerateLink: (product: Product) => void;
}

function ProductCard({ product, onGenerateLink }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;
  const commission = Math.floor((product.price * product.commissionPercentage) / 100);

  const imageSrc =
    product.imageUrl ||
    `https://placehold.co/300x200/1a1a1a/4ade80?text=${encodeURIComponent(product.title.slice(0, 4))}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 ${
        isOutOfStock
          ? "border-zinc-200 opacity-50 grayscale dark:border-zinc-800"
          : "border-zinc-200 hover:border-purple-300 dark:border-zinc-800 dark:hover:border-purple-700"
      }`}
    >
      <div className="aspect-[3/2] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={product.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-zinc-950 line-clamp-2 dark:text-zinc-50">
          {product.title}
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">মূল্য:</span>
            <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {formatBdt(product.price)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">আপনার কমিশন:</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {product.commissionPercentage}% ({formatBdt(commission)})
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">স্টক:</span>
            <span
              className={`text-sm font-semibold ${
                isOutOfStock ? "text-red-600 dark:text-red-400" : "text-zinc-950 dark:text-zinc-50"
              }`}
            >
              {isOutOfStock ? "স্টক শেষ" : `${product.stockQuantity} পিস`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGenerateLink(product)}
          disabled={isOutOfStock}
          className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isOutOfStock
              ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 focus-visible:outline-zinc-600"
              : "bg-purple-700 text-white shadow-sm hover:bg-purple-600 hover:shadow-md focus-visible:outline-purple-500 dark:bg-purple-600 dark:hover:bg-purple-500"
          }`}
        >
          {isOutOfStock ? (
            "লিংক তৈরি করা সম্ভব নয়"
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              লিংক তৈরি করুন
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  promoterId: string;
}

function LinkModal({ isOpen, onClose, product, promoterId }: LinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://inshirah.com";

  const uniqueLink = `${baseUrl}/p/${product._id}?ref=${promoterId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uniqueLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = uniqueLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                আপনার ইউনিক প্রমোশন লিংক
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {product.title} — এর জন্য আপনার বিশেষ লিংক
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={uniqueLink}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none dark:text-zinc-300"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950 transition-all hover:border-purple-700 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-purple-600 dark:hover:bg-purple-950/40"
            >
              {copied ? (
                <>
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  কপি হয়েছে
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  কপি করুন
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <svg className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            এই লিংকটি শেয়ার করুন — কেউ কিনলে আপনি কমিশন পাবেন।
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 transition-all hover:border-purple-700 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-purple-600 dark:hover:bg-purple-950/40"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [promoterId, setPromoterId] = useState<string>("");

  // Fetch products and promoter ID in parallel
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) {
          setProductsError(data.error ?? "প্রোডাক্ট লোড করতে সমস্যা হয়েছে");
          return;
        }
        setProducts(data.products as Product[]);
      } catch {
        setProductsError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const fetchPromoterId = async () => {
      try {
        const res = await fetch("/api/promoter/profile");
        if (res.ok) {
          const data = await res.json();
          setPromoterId(data.promoter._id as string);
        }
      } catch {
        // Non-critical — link will just lack a ref param
      }
    };

    fetchProducts();
    fetchPromoterId();
  }, []);

  const handleGenerateLink = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-white p-8 shadow-sm dark:border-zinc-800 dark:from-purple-950/30 dark:to-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 dark:bg-purple-500">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">প্রমোটার প্যানেল</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              হালাল প্রোডাক্ট লাইব্রেরি
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          নিচের তালিকা থেকে প্রোডাক্ট বেছে নিয়ে আপনার ইউনিক প্রমোশন লিংক
          তৈরি করুন।
        </p>
      </section>

      {/* Error state */}
      {productsError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {productsError}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoadingProducts && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </section>
      )}

      {/* Empty state */}
      {!isLoadingProducts && !productsError && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950">
            <svg className="h-8 w-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            এখনো কোনো প্রোডাক্ট নেই
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            মার্চেন্টরা প্রোডাক্ট যুক্ত করলে এখানে দেখাবে।
          </p>
        </div>
      )}

      {/* Product grid */}
      {!isLoadingProducts && products.length > 0 && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onGenerateLink={handleGenerateLink}
            />
          ))}
        </section>
      )}

      <LinkModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        promoterId={promoterId}
      />
    </div>
  );
}
