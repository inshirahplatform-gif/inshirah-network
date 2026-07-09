"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type Installment = {
  _id: string;
  orderId: string;
  totalAmount: number;
  downPayment: number;
  installmentAmount: number;
  installmentCount: number;
  type: "murabaha" | "ijara";
  status: "active" | "completed" | "cancelled";
  paidInstallments: number;
  nextDueDate: string;
  createdAt: string;
};

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTypeLabel(type: Installment["type"]) {
  const labels = {
    murabaha: "মুরাবাহা (কস্ট-প্লাস)",
    ijara: "ইজারা (লিজিং)",
  };
  return labels[type];
}

function getStatusLabel(status: Installment["status"]) {
  const labels = {
    active: "চলমান",
    completed: "সম্পন্ন",
    cancelled: "বাতিল",
  };
  return labels[status];
}

function getStatusColor(status: Installment["status"]) {
  const colors = {
    active: "bg-emerald-950/50 text-emerald-400",
    completed: "bg-blue-950/50 text-blue-400",
    cancelled: "bg-red-950/50 text-red-400",
  };
  return colors[status];
}

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        const res = await fetch("/api/installments");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "ইনস্টলমেন্ট লোড করতে সমস্যা হয়েছে");
          return;
        }

        setInstallments(data.installments || []);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstallments();
  }, []);

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
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-50">ইনস্টলমেন্ট প্ল্যান</h1>
          <p className="mt-2 text-sm text-zinc-400">
            শরিয়াহ-সম্মত সুদ-মুক্ত পেমেন্ট প্ল্যান
          </p>
        </div>

        {/* Shariah Compliance Info */}
        <div className="mb-8 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4">
            শরিয়াহ-সম্মত ইনস্টলমেন্ট সিস্টেম
          </h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              <span className="font-medium text-zinc-50">মুরাবাহা (Murabaha):</span>{" "}
              কস্ট-প্লাস মূল্যে পণ্য বিক্রি। কোনো সুদ নেই, শুধুমাত্র যুক্তিসঙ্গত লাভ।
            </p>
            <p>
              <span className="font-medium text-zinc-50">ইজারা (Ijara):</span>{" "}
              পণ্য লিজ করে ব্যবহার। মাসিক লিজ ফি প্রদান, সুদমুক্ত।
            </p>
            <p>
              <span className="font-medium text-zinc-50">সুবিধা:</span>{" "}
              ২৫% ডাউন পেমেন্ট, ৩-১২ মাসের ইনস্টলমেন্ট, কোনো লুকানো খরচ নেই।
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {installments.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-medium text-zinc-50">
              কোনো ইনস্টলমেন্ট প্ল্যান নেই
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              অর্ডার থেকে ইনস্টলমেন্ট প্ল্যান তৈরি করুন
            </p>
            <Link
              href="/orders"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              অর্ডার দেখুন
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {installments.map((installment) => {
              const remainingInstallments =
                installment.installmentCount - installment.paidInstallments;
              const remainingAmount =
                remainingInstallments * installment.installmentAmount;

              return (
                <div
                  key={installment._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            installment.status
                          )}`}
                        >
                          {getStatusLabel(installment.status)}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {getTypeLabel(installment.type)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        অর্ডার #{installment.orderId.slice(-8)}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${installment.orderId}`}
                      className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      অর্ডার দেখুন
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-400">মোট পরিমাণ</p>
                      <p className="mt-1 text-lg font-bold text-zinc-50">
                        {formatBdt(installment.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-400">ডাউন পেমেন্ট</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        {formatBdt(installment.downPayment)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-400">মাসিক কিস্তি</p>
                      <p className="mt-1 text-lg font-bold text-zinc-50">
                        {formatBdt(installment.installmentAmount)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-xs text-zinc-400">মোট কিস্তি</p>
                      <p className="mt-1 text-lg font-bold text-zinc-50">
                        {installment.installmentCount}
                      </p>
                    </div>
                  </div>

                  {installment.status === "active" && (
                    <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-400">
                            বাকি কিস্তি: {remainingInstallments}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            বাকি পরিমাণ: {formatBdt(remainingAmount)}
                          </p>
                        </div>
                        {installment.nextDueDate && (
                          <div className="text-right">
                            <p className="text-xs text-zinc-400">পরবর্তী তারিখ</p>
                            <p className="mt-1 text-sm font-medium text-zinc-50">
                              {new Date(installment.nextDueDate).toLocaleDateString(
                                "bn-BD",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {installment.status === "active" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>প্রগতি</span>
                        <span>
                          {installment.paidInstallments} / {installment.installmentCount}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-emerald-600 transition-all"
                          style={{
                            width: `${(installment.paidInstallments / installment.installmentCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
