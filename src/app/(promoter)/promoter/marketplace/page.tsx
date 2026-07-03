"use client";

import { useState, useEffect } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

interface Product {
  id: string;
  title: string;
  price: number;
  commission: number;
  commissionPercentage: number;
  stockQuantity: number;
  imagePlaceholder: string;
}

// Hardcoded mock products — replace with a real API fetch in a future phase
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    title: "প্রিমিয়াম সুন্নতি আতর",
    price: 800,
    commission: 80,
    commissionPercentage: 10,
    stockQuantity: 45,
    imagePlaceholder: "https://via.placeholder.com/300x200/1a1a1a/4ade80?text=আতর",
  },
  {
    id: "prod-002",
    title: "মডার্ন সুতি হিজাব",
    price: 650,
    commission: 65,
    commissionPercentage: 10,
    stockQuantity: 32,
    imagePlaceholder: "https://via.placeholder.com/300x200/1a1a1a/60a5fa?text=হিজাব",
  },
  {
    id: "prod-003",
    title: "অরিজিনাল দেশি মধু",
    price: 1200,
    commission: 120,
    commissionPercentage: 10,
    stockQuantity: 0,
    imagePlaceholder: "https://via.placeholder.com/300x200/1a1a1a/fbbf24?text=মধু",
  },
];

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onGenerateLink: (product: Product) => void;
}

function ProductCard({ product, onGenerateLink }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

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
          src={product.imagePlaceholder}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-zinc-50">{product.title}</h3>

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
              {product.commissionPercentage}% ({formatBdt(product.commission)})
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

  const uniqueLink = `${baseUrl}/p/${product.id}?ref=${promoterId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uniqueLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Real promoter ID fetched from the session-backed profile endpoint
  const [promoterId, setPromoterId] = useState<string>("");
  const [isLoadingId, setIsLoadingId] = useState(true);

  useEffect(() => {
    const fetchPromoterId = async () => {
      try {
        const res = await fetch("/api/promoter/profile");
        if (res.ok) {
          const data = await res.json();
          // _id from MongoDB is returned as a string via lean()
          setPromoterId(data.promoter._id as string);
        }
      } catch {
        // Non-critical: the link will just lack a ref param if this fails
      } finally {
        setIsLoadingId(false);
      }
    };

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
        {isLoadingId && (
          <p className="mt-2 text-xs text-zinc-600">
            আপনার প্রোফাইল লোড হচ্ছে…
          </p>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onGenerateLink={handleGenerateLink}
          />
        ))}
      </section>

      <LinkModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        promoterId={promoterId}
      />
    </div>
  );
}
