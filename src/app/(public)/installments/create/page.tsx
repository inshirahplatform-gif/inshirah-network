"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function InstallmentCreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [orderAmount, setOrderAmount] = useState(0);
  const [type, setType] = useState<"murabaha" | "ijara">("murabaha");
  const [installmentCount, setInstallmentCount] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate installment plan
  const calculatePlan = () => {
    const murabahaMargin = type === "murabaha" ? 0.12 : 0;
    const totalWithMargin = orderAmount * (1 + murabahaMargin);
    const downPaymentPercentage = 0.25;
    const downPayment = totalWithMargin * downPaymentPercentage;
    const remainingAmount = totalWithMargin - downPayment;
    const installmentAmount = remainingAmount / installmentCount;

    return {
      totalAmount: totalWithMargin,
      downPayment,
      installmentAmount,
      installmentCount,
    };
  };

  const plan = calculatePlan();

  useEffect(() => {
    if (orderId) {
      // Fetch order details to get the amount
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrderAmount(data.order.totalAmount);
          }
        })
        .catch(() => {
          setError("অর্ডার লোড করতে সমস্যা হয়েছে");
        });
    }
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          type,
          installmentCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "ইনস্টলমেন্ট প্ল্যান তৈরি করতে সমস্যা হয়েছে");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/installments");
      }, 2000);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            অর্ডার আইডি প্রদান করতে হবে
          </div>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
          >
            অর্ডার তালিকায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-8 text-center">
            <svg className="mx-auto h-20 w-20 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-2xl font-bold text-emerald-400">
              ইনস্টলমেন্ট প্ল্যান সফলভাবে তৈরি হয়েছে
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              ইনস্টলমেন্ট পেজে রিডাইরেক্ট হচ্ছে...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
        >
          ← অর্ডার তালিকায় ফিরে যান
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-zinc-50">ইনস্টলমেন্ট প্ল্যান তৈরি করুন</h1>
          <p className="mt-2 text-sm text-zinc-400">
            শরিয়াহ-সম্মত সুদ-মুক্ত পেমেন্ট প্ল্যান
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Installment Type */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold text-zinc-50 mb-4">
                ইনস্টলমেন্ট টাইপ
              </h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="type"
                    value="murabaha"
                    checked={type === "murabaha"}
                    onChange={(e) => setType(e.target.value as "murabaha" | "ijara")}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">মুরাবাহা (Murabaha)</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      কস্ট-প্লাস মূল্যে পণ্য ক্রয়। ১২% লাভ মার্জিন।
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-700/50 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-950/20">
                  <input
                    type="radio"
                    name="type"
                    value="ijara"
                    checked={type === "ijara"}
                    onChange={(e) => setType(e.target.value as "murabaha" | "ijara")}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-50">ইজারা (Ijara)</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      পণ্য লিজ করে ব্যবহার। কোনো লাভ মার্জিন নেই।
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Installment Count */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold text-zinc-50 mb-4">
                ইনস্টলমেন্ট সংখ্যা
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[3, 6, 9, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setInstallmentCount(count)}
                    disabled={isSubmitting}
                    className={`rounded-xl border p-4 text-center transition-colors ${
                      installmentCount === count
                        ? "border-emerald-700 bg-emerald-950/20 text-emerald-400"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs">মাস</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  তৈরি হচ্ছে…
                </>
              ) : (
                "ইনস্টলমেন্ট প্ল্যান তৈরি করুন"
              )}
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
            <h2 className="text-xl font-semibold text-zinc-50 mb-6">
              পেমেন্ট সারসংক্ষেপ
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">অর্ডার পরিমাণ</span>
                <span className="font-medium text-zinc-50">
                  {formatBdt(orderAmount)}
                </span>
              </div>

              {type === "murabaha" && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">লাভ মার্জিন (১২%)</span>
                  <span className="font-medium text-amber-400">
                    {formatBdt(orderAmount * 0.12)}
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">মোট পরিমাণ</span>
                  <span className="font-medium text-zinc-50">
                    {formatBdt(plan.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-zinc-400">ডাউন পেমেন্ট (২৫%)</span>
                  <span className="font-medium text-emerald-400">
                    {formatBdt(plan.downPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-zinc-400">মাসিক কিস্তি</span>
                  <span className="font-medium text-zinc-50">
                    {formatBdt(plan.installmentAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-zinc-400">মোট কিস্তি</span>
                  <span className="font-medium text-zinc-50">
                    {plan.installmentCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-emerald-400">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span>
                  শরিয়াহ-সম্মত সুদ-মুক্ত পেমেন্ট প্ল্যান। কোনো লুকানো খরচ নেই।
                </span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InstallmentCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">লোড হচ্ছে...</div>}>
      <InstallmentCreateContent />
    </Suspense>
  );
}
