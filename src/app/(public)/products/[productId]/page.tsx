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
  description: string;
  price: number;
  commissionPercentage: number;
  stockQuantity: number;
  status: string;
  imageUrl?: string;
  galleryImages?: string[];
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductViewPage({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { productId } = await params;
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "প্রোডাক্ট লোড করতে সমস্যা হয়েছে");
          return;
        }

        setProduct(data.product);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-zinc-950 px-6`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-zinc-950 px-6`}
      >
        <div className="text-center">
          <p className="text-5xl">😔</p>
          <h1 className="mt-6 text-2xl font-bold text-zinc-50">
            {error || "প্রোডাক্টটি পাওয়া যায়নি"}
          </h1>
          <p className="mt-3 text-zinc-400">
            {error || "আপনি যে পণ্যটি খুঁজছেন সেটি আর পাওয়া যাচ্ছে না।"}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-6 text-sm font-semibold text-zinc-50 transition-colors hover:border-emerald-700 hover:bg-emerald-950/40"
          >
            ← হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.status !== "active" || product.stockQuantity < 1;

  // ── Main product view ──────────────────────────────────────────────────────
  return (
    <div
      className={`${notoSansBengali.className} min-h-screen bg-zinc-950 px-4 py-10 sm:px-6 sm:py-16`}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-emerald-400"
        >
          ← হোমে ফিরুন
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── Left: image gallery with zoom ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <div 
                className="relative aspect-square w-full overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {product.imageUrl || (product.galleryImages && product.galleryImages[selectedImage]) ? (
                  <>
                    <Image
                      src={product.galleryImages && product.galleryImages[selectedImage] ? product.galleryImages[selectedImage]! : product.imageUrl!}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-200"
                      style={{
                        transform: isHovering ? 'scale(2)' : 'scale(1)',
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }}
                      unoptimized
                    />
                    {isHovering && (
                      <div className="absolute inset-0 border-2 border-emerald-500/50 pointer-events-none" />
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <span className="text-6xl select-none">🛍️</span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
                  <span className="rounded-full border border-red-700/50 bg-red-950/80 px-5 py-2 text-sm font-semibold text-red-400">
                    স্টক শেষ
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.imageUrl && (
                  <button
                    onClick={() => setSelectedImage(-1)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === -1
                        ? "border-emerald-500 opacity-100"
                        : "border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={product.imageUrl}
                      alt="Main image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                )}
                {product.galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? "border-emerald-500 opacity-100"
                        : "border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: product details ───────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Halal badge */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              শারীয়াহ-সম্মত পণ্য
            </span>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-zinc-50 sm:text-3xl">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight text-emerald-400">
                {formatBdt(product.price)}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-800" />

            {/* Description */}
            <p className="text-sm leading-7 text-zinc-400">
              {product.description}
            </p>

            {/* Stock info */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOutOfStock ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isOutOfStock ? "text-red-400" : "text-zinc-400"
                }`}
              >
                {isOutOfStock
                  ? "স্টক শেষ হয়ে গেছে"
                  : `${product.stockQuantity} পিস স্টকে আছে`}
              </span>
            </div>

            {/* Commission info for promoters */}
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <p className="text-xs font-medium text-zinc-500">
                প্রমোটার কমিশন
              </p>
              <p className="mt-0.5 text-sm font-semibold text-amber-400">
                {product.commissionPercentage}% ={" "}
                {formatBdt(
                  (product.price * product.commissionPercentage) / 100
                )}{" "}
                প্রতি বিক্রয়
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  // Add to cart
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
                }}
                disabled={isOutOfStock}
                className={`inline-flex h-13 w-full items-center justify-center rounded-xl px-6 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isOutOfStock
                    ? "pointer-events-none cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : "bg-emerald-700 text-white hover:bg-emerald-600 focus-visible:outline-emerald-500"
                }`}
              >
                {isOutOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
              </button>

              <p className="text-center text-xs text-zinc-600">
                শারীয়াহ-সম্মত লেনদেন। কোনো সুদ বা অনৈতিক শর্ত নেই।
              </p>
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-800 pt-6">
              {[
                { icon: "🛡️", label: "শারীয়াহ যাচাইকৃত" },
                { icon: "📦", label: "ফিজিক্যাল স্টক" },
                { icon: "✅", label: "নিরাপদ পেমেন্ট" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-zinc-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
