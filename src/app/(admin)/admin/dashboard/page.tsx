"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const PLATFORM_STATS = {
  totalMerchants: 12,
  totalPromoters: 350,
  platformFees: 4500,
  pendingWithdrawals: 3,
} as const;

interface PayoutRequest {
  id: string;
  promoterName: string;
  amount: number;
  method: "বিকাশ" | "নগদ" | "ব্যাংক";
  accountNumber: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_PAYOUTS: PayoutRequest[] = [
  {
    id: "payout-001",
    promoterName: "আব্দুল্লাহ আল মামুন",
    amount: 800,
    method: "বিকাশ",
    accountNumber: "01712345678",
    status: "pending",
  },
  {
    id: "payout-002",
    promoterName: "ফাতেমা জাহান",
    amount: 1200,
    method: "নগদ",
    accountNumber: "01898765432",
    status: "pending",
  },
  {
    id: "payout-003",
    promoterName: "মুহাম্মদ হাসান",
    amount: 650,
    method: "ব্যাংক",
    accountNumber: "1234567890123",
    status: "pending",
  },
];

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatCardProps = {
  label: string;
  value: string;
  accent?: "emerald" | "amber" | "sky" | "violet";
};

function StatCard({ label, value, accent = "emerald" }: StatCardProps) {
  const accentClasses = {
    emerald: "from-emerald-500/15 to-transparent text-emerald-400",
    amber: "from-amber-500/15 to-transparent text-amber-400",
    sky: "from-sky-500/15 to-transparent text-sky-400",
    violet: "from-violet-500/15 to-transparent text-violet-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentClasses[accent]}`}
      />
      <p className="relative text-sm font-medium text-zinc-400">{label}</p>
      <p className="relative mt-3 text-3xl font-bold tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(MOCK_PAYOUTS);

  const handleApprove = (id: string) => {
    setPayouts((prev) =>
      prev.map((payout) =>
        payout.id === id ? { ...payout, status: "approved" } : payout
      )
    );
  };

  const handleReject = (id: string) => {
    setPayouts((prev) =>
      prev.map((payout) =>
        payout.id === id ? { ...payout, status: "rejected" } : payout
      )
    );
  };

  const pendingPayouts = payouts.filter((p) => p.status === "pending");

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section>
        <p className="text-sm font-semibold text-emerald-400">সুপার অ্যাডমিন</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          ইনশিরাহ অ্যাডমিন কন্ট্রোল সেন্টার
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          প্ল্যাটফর্মের সব কার্যকলাপ, ব্যবহারকারী এবং আর্থিক লেনদেন এক জায়গায় দেখুন।
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="মোট মার্চেন্ট"
          value={`${PLATFORM_STATS.totalMerchants} জন`}
          accent="emerald"
        />
        <StatCard
          label="মোট প্রমোটার"
          value={`${PLATFORM_STATS.totalPromoters} জন`}
          accent="sky"
        />
        <StatCard
          label="প্ল্যাটফর্ম রেভিনিউ/ফি"
          value={formatBdt(PLATFORM_STATS.platformFees)}
          accent="amber"
        />
        <StatCard
          label="পেন্ডিং উইথড্রয়াল"
          value={`${PLATFORM_STATS.pendingWithdrawals} টি`}
          accent="violet"
        />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-800 p-6">
          <h3 className="text-xl font-semibold text-zinc-50">
            পেন্ডিং উত্তোলন অনুরোধ (৳৫০০+)
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            প্রমোটারদের উত্তোলন অনুরোধ পর্যালোচনা করুন এবং অনুমোদন/বাতিল করুন।
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  প্রমোটারের নাম
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  উত্তোলনের পরিমাণ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  মাধ্যম
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  অ্যাকাউন্ট নম্বর
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingPayouts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-zinc-500"
                  >
                    কোনো পেন্ডিং উত্তোলন অনুরোধ নেই
                  </td>
                </tr>
              ) : (
                pendingPayouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-950/30"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-50">
                      {payout.promoterName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                      {formatBdt(payout.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {payout.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {payout.accountNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-amber-950/50 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-900/50">
                        পেন্ডিং
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(payout.id)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-700 px-4 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                        >
                          অনুমোদন করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(payout.id)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/30 px-4 text-xs font-semibold text-red-400 transition-colors hover:border-red-700 hover:bg-red-950/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        >
                          বাতিল করুন
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
