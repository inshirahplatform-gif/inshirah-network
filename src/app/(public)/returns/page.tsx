"use client";

import { useState } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type ReturnRequest = {
  orderId: string;
  reason: string;
  description: string;
};

export default function ReturnsPage() {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          reason,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "রিটার্ন রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে");
        return;
      }

      setSuccess(true);
      setOrderId("");
      setReason("");
      setDescription("");
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
        >
          ← অর্ডার তালিকায় ফিরে যান
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-zinc-50">রিটার্ন রিকোয়েস্ট</h1>
          <p className="mt-2 text-sm text-zinc-400">
            প্রোডাক্ট রিটার্ন বা রিফান্ডের জন্য আবেদন করুন
          </p>
        </div>

        {/* Return Policy Info */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-4">
            রিটার্ন পলিসি
          </h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              <span className="font-medium text-zinc-50">৭ দিনের রিটার্ন পলিসি:</span>{" "}
              ডেলিভারির পর ৭ দিনের মধ্যে রিটার্ন রিকোয়েস্ট করতে পারবেন।
            </p>
            <p>
              <span className="font-medium text-zinc-50">শরিয়াহ-সম্মত রিফান্ড:</span>{" "}
              কোনো সুদ বা অনৈতিক শর্ত ছাড়াই পুরো অর্থ ফেরত দেওয়া হবে।
            </p>
            <p>
              <span className="font-medium text-zinc-50">রিটার্নের কারণ:</span>{" "}
              প্রোডাক্ট ত্রুটিপূর্ণ, ভুল প্রোডাক্ট, বা বিবরণের সাথে মিলছে না।
            </p>
            <p>
              <span className="font-medium text-zinc-50">প্রসেসিং সময়:</span>{" "}
              রিটার্ন রিকোয়েস্ট প্রসেস করতে ৩-৫ কার্যদিবস সময় লাগতে পারে।
            </p>
          </div>
        </div>

        {/* Return Request Form */}
        {success ? (
          <div className="mt-8 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6 text-center">
            <svg className="mx-auto h-16 w-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-emerald-400">
              রিটার্ন রিকোয়েস্ট গ্রহণ করা হয়েছে
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              আমরা শীঘ্রই আপনার রিকোয়েস্ট প্রসেস করব। আপনার ফোনে যোগাযোগ করা হবে।
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              নতুন রিকোয়েস্ট করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-50 mb-2">
                অর্ডার আইডি *
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="অর্ডার আইডি লিখুন"
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder-zinc-600 focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-50 mb-2">
                রিটার্নের কারণ *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-50 focus:border-emerald-700 focus:outline-none"
              >
                <option value="">কারণ নির্বাচন করুন</option>
                <option value="defective">প্রোডাক্ট ত্রুটিপূর্ণ</option>
                <option value="wrong_item">ভুল প্রোডাক্ট পাঠানো হয়েছে</option>
                <option value="not_as_described">বিবরণের সাথে মিলছে না</option>
                <option value="damaged">ডেলিভারির সময় ক্ষতিগ্রস্ত</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-50 mb-2">
                বিস্তারিত বিবরণ *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="সমস্যাটি বিস্তারিত লিখুন..."
                required
                rows={4}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder-zinc-600 focus:border-emerald-700 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? "পাঠানো হচ্ছে..." : "রিটার্ন রিকোয়েস্ট পাঠান"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
