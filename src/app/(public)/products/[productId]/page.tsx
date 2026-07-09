"use client";

import { useState, useEffect, Suspense } from "react";
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
  category: string;
  imageUrl?: string;
  galleryImages?: string[];
};

type Review = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

type ReviewSummary = {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: number[];
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductViewPage({ params }: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-zinc-400">লোড হচ্ছে...</div>}>
      <ProductViewContent params={params} />
    </Suspense>
  );
}

function ProductViewContent({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
        setRelatedProducts(data.relatedProducts || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const { productId } = await params;
        const res = await fetch(`/api/products/${productId}/reviews`);
        const data = await res.json();

        if (res.ok) {
          setReviews(data.reviews || []);
          setReviewSummary(data.summary || null);
        }
      } catch {
        // Silently fail for reviews
      }
    };

    fetchProduct();
    fetchReviews();
  }, [params]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (isLoading) {
    return (
      <div className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-white px-6 dark:bg-zinc-950`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className={`${notoSansBengali.className} flex min-h-screen items-center justify-center bg-white px-6 dark:bg-zinc-950`}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <svg className="h-8 w-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {error || "প্রোডাক্টটি পাওয়া যায়নি"}
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {error || "আপনি যে পণ্যটি খুঁজছেন সেটি আর পাওয়া যাচ্ছে না।"}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:border-emerald-700 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40"
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
      className={`${notoSansBengali.className} min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 sm:py-16 dark:bg-zinc-950`}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          ← হোমে ফিরুন
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── Left: image gallery with zoom ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
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
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
                    <svg className="h-16 w-16 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
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
                        : "border-zinc-200 opacity-60 hover:opacity-100 dark:border-zinc-700"
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
                        : "border-zinc-200 opacity-60 hover:opacity-100 dark:border-zinc-700"
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
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
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
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatBdt(product.price)}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

            {/* Description */}
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
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
                  isOutOfStock ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {isOutOfStock
                  ? "স্টক শেষ হয়ে গেছে"
                  : `${product.stockQuantity} পিস স্টকে আছে`}
              </span>
            </div>

            {/* Commission info for promoters */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                প্রমোটার কমিশন
              </p>
              <p className="mt-0.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
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
                    ? "pointer-events-none cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                    : "bg-emerald-700 text-white hover:bg-emerald-600 focus-visible:outline-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                }`}
              >
                {isOutOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
              </button>

              <button
                onClick={() => {
                  // Add to comparison
                  const comparisonItem = {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    category: product.category,
                    stockQuantity: product.stockQuantity,
                    imageUrl: product.imageUrl,
                    commissionPercentage: product.commissionPercentage,
                  };
                  const existingComparison = JSON.parse(localStorage.getItem("inshirah_compare") || "[]");
                  
                  // Check if already in comparison
                  if (existingComparison.some((p: any) => p._id === product._id)) {
                    return;
                  }
                  
                  // Limit to 4 products
                  if (existingComparison.length >= 4) {
                    alert("সর্বোচ্চ ৪টি প্রোডাক্ট তুলনা করতে পারবেন");
                    return;
                  }
                  
                  const updatedComparison = [...existingComparison, comparisonItem];
                  localStorage.setItem("inshirah_compare", JSON.stringify(updatedComparison));
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                তুলনায় যোগ করুন
              </button>

              <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
                শারীয়াহ-সম্মত লেনদেন। কোনো সুদ বা অনৈতিক শর্ত নেই।
              </p>
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {[
                { 
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>, 
                  label: "শারীয়াহ যাচাইকৃত" 
                },
                { 
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>, 
                  label: "ফিজিক্যাল স্টক" 
                },
                { 
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>, 
                  label: "নিরাপদ পেমেন্ট" 
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">ক্রেতা রিভিউ</h2>

          {reviewSummary && (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-zinc-950 dark:text-zinc-50">
                    {reviewSummary.averageRating}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= Math.round(reviewSummary.averageRating)
                            ? "text-amber-400"
                            : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {reviewSummary.totalReviews} টি রিভিউ
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewSummary.ratingDistribution[rating - 1];
                    const percentage =
                      reviewSummary.totalReviews > 0
                        ? (count / reviewSummary.totalReviews) * 100
                        : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-zinc-600 dark:text-zinc-400">{rating} <svg className="inline h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg></span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-amber-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-zinc-500 text-right dark:text-zinc-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-zinc-500 py-8 dark:text-zinc-500">
                এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating
                                  ? "text-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </span>
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            ভেরিফাইড পারচেস
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold text-zinc-950 dark:text-zinc-50">
                        {review.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {review.comment}
                      </p>
                      {review.images && review.images.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {review.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                            >
                              <Image
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                        <span>
                          {new Date(review.createdAt).toLocaleDateString("bn-BD")}
                        </span>
                        <button
                          className="hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
                          onClick={() => {
                            // Handle helpful vote
                            fetch(`/api/reviews/${review._id}/helpful`, {
                              method: "POST",
                            });
                          }}
                        >
                          সহায়ক ({review.helpfulCount})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">সম্পর্কিত প্রোডাক্ট</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct._id}`}
                  className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    {relatedProduct.imageUrl ? (
                      <Image
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-950 group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                      {relatedProduct.title}
                    </h3>
                    <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBdt(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
