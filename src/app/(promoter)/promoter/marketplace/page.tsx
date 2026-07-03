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
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="aspect-[3/2] w-full animate-pulse bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-zinc-800" />
        <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-zinc-800" />
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
      className={`relative overflow-hidden rounded-2xl border bg-zinc-900 shadow-sm transition-all ${
        isOutOfStock
          ? "border-zinc-800 opacity-50 grayscale"
          : "border-zinc-800 hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-900/10"
      }`}
    >
      <div className="aspect-[3/2] w-full overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-zinc-50 line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">মূল্য:</span>
            <span className="text-sm font-semibold text-zinc-50">
              {formatBdt(product.price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">আপনার কমিশন:</span>
            <span className="text-sm font-semibold text-emerald-400">
              {product.commissionPercentage}% ({formatBdt(commission)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">স্টক:</span>
            <span
              className={`text-sm font-semibold ${
                isOutOfStock ? "text-red-400" : "text-zinc-50"
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
          className={`mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isOutOfStock
              ? "cursor-not-allowed bg-zinc-800 text-zinc-500 focus-visible:outline-zinc-600"
              : "bg-emerald-700 text-white hover:bg-emerald-600 focus-visible:outline-emerald-500"
          }`}
        >
          {isOutOfStock ? "লিংক তৈরি করা সম্ভব নয়" : "লিংক তৈরি করুন"}
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
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/50">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-zinc-50">
            আপনার ইউনিক প্রমোশন লিংক
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            {product.title} — এর জন্য আপনার বিশেষ লিংক
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={uniqueLink}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-300 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-50 transition-colors hover:border-emerald-700 hover:bg-emerald-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {copied ? "✓ কপি হয়েছে" : "কপি করুন"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-600">
          এই লিংকটি শেয়ার করুন — কেউ কিনলে আপনি কমিশন পাবেন।
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-6 text-sm font-semibold text-zinc-50 transition-colors hover:border-emerald-700 hover:bg-emerald-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
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
      <section>
        <p className="text-sm font-semibold text-emerald-400">প্রমোটার প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          হালাল প্রোডাক্ট লাইব্রেরি
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          নিচের তালিকা থেকে প্রোডাক্ট বেছে নিয়ে আপনার ইউনিক প্রমোশন লিংক
          তৈরি করুন।
        </p>
      </section>

      {/* Error state */}
      {productsError && (
        <p className="rounded-lg border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {productsError}
        </p>
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center">
          <p className="text-lg font-semibold text-zinc-300">
            এখনো কোনো প্রোডাক্ট নেই
          </p>
          <p className="mt-2 text-sm text-zinc-500">
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
