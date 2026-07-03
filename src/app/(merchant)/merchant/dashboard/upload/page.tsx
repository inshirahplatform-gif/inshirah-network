"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type Banner = { type: "success" | "error"; text: string } | null;

function AlertBanner({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const styles =
    banner.type === "success"
      ? "border-emerald-700/50 bg-emerald-950/40 text-emerald-300"
      : "border-red-700/50 bg-red-950/40 text-red-300";
  const icon = banner.type === "success" ? "✓" : "✕";
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
      <span>{banner.text}</span>
    </div>
  );
}

export default function ProductUploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    commissionPercentage: "",
    stockQuantity: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "প্রোডাক্টের নাম আবশ্যক";
    if (!formData.description.trim()) newErrors.description = "প্রোডাক্টের বিবরণ আবশ্যক";
    if (!formData.price.trim()) {
      newErrors.price = "মূল্য আবশ্যক";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "সঠিক মূল্য দিন";
    }
    if (!formData.commissionPercentage.trim()) {
      newErrors.commissionPercentage = "কমিশন আবশ্যক";
    } else if (
      isNaN(Number(formData.commissionPercentage)) ||
      Number(formData.commissionPercentage) <= 0 ||
      Number(formData.commissionPercentage) > 100
    ) {
      newErrors.commissionPercentage = "কমিশন ০-১০০% এর মধ্যে হতে হবে";
    }
    if (!formData.stockQuantity.trim()) {
      newErrors.stockQuantity = "স্টক সংখ্যা আবশ্যক";
    } else if (
      isNaN(Number(formData.stockQuantity)) ||
      Number(formData.stockQuantity) < 1 ||
      !Number.isInteger(Number(formData.stockQuantity))
    ) {
      newErrors.stockQuantity = "সঠিক স্টক সংখ্যা দিন (ন্যূনতম ১, পূর্ণসংখ্যা)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // merchantId is extracted server-side from the session cookie
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          commissionPercentage: Number(formData.commissionPercentage),
          stockQuantity: Number(formData.stockQuantity),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setBanner({ type: "success", text: data.message ?? "প্রোডাক্ট সফলভাবে লাইভ হয়েছে!" });
        setFormData({ title: "", description: "", price: "", commissionPercentage: "", stockQuantity: "" });
        setErrors({});
      } else {
        setBanner({ type: "error", text: data.error ?? "প্রোডাক্ট আপলোডে সমস্যা হয়েছে" });
      }
    } catch {
      setBanner({ type: "error", text: "নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBanner(null);
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const inputOk = "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500";
  const inputErr = "border-red-500/50 focus-visible:outline-red-500";

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section>
        <p className="text-sm font-semibold text-emerald-400">মার্চেন্ট প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">নতুন প্রোডাক্ট যুক্ত করুন</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          আপনার হালাল প্রোডাক্টের তথ্য দিয়ে মার্কেটপ্লেসে যুক্ত করুন।
        </p>
      </section>

      <section className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
              প্রোডাক্টের নাম <span className="text-red-400">*</span>
            </label>
            <input
              type="text" id="title" name="title"
              value={formData.title} onChange={handleChange}
              placeholder="প্রোডাক্টের নাম লিখুন" disabled={isLoading}
              className={`${inputBase} ${errors.title ? inputErr : inputOk}`}
            />
            {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
              প্রোডাক্টের বিবরণ <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন"
              rows={4} disabled={isLoading}
              className={`${inputBase} resize-none ${errors.description ? inputErr : inputOk}`}
            />
            {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-zinc-300">
              মূল্য (৳) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" id="price" name="price"
              value={formData.price} onChange={handleChange}
              placeholder="মূল্য টাকায় লিখুন" min="0" step="0.01" disabled={isLoading}
              className={`${inputBase} ${errors.price ? inputErr : inputOk}`}
            />
            {errors.price && <p className="text-sm text-red-400">{errors.price}</p>}
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <label htmlFor="commissionPercentage" className="block text-sm font-medium text-zinc-300">
              প্রোমোটার কমিশন (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" id="commissionPercentage" name="commissionPercentage"
              value={formData.commissionPercentage} onChange={handleChange}
              placeholder="কমিশন শতাংশে লিখুন (যেমন: ৫, ১০)" min="0" max="100" step="0.1" disabled={isLoading}
              className={`${inputBase} ${errors.commissionPercentage ? inputErr : inputOk}`}
            />
            {errors.commissionPercentage && <p className="text-sm text-red-400">{errors.commissionPercentage}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-zinc-300">
              ফিজিক্যাল স্টক সংখ্যা (পিস) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" id="stockQuantity" name="stockQuantity"
              value={formData.stockQuantity} onChange={handleChange}
              placeholder="আপনার কাছে থাকা স্টকের সংখ্যা" min="1" step="1" disabled={isLoading}
              className={`${inputBase} ${errors.stockQuantity ? inputErr : inputOk}`}
            />
            {errors.stockQuantity && <p className="text-sm text-red-400">{errors.stockQuantity}</p>}

            {/* Shariah warning */}
            <div className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-400">
                <svg className="mt-0.5 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>
                  শতর্কতা: শারীয়াহ নীতিমালা অনুযায়ী আপনার ফিজিক্যাল স্টকে বা সরাসরি মালিকানায় নেই এমন পণ্য
                  লিস্টিং করা সম্পূর্ণ নিষিদ্ধ। স্টক ০ হওয়া মাত্রই প্রোডাক্টটি স্বয়ংক্রিয়ভাবে হাইড হয়ে যাবে।
                </span>
              </p>
            </div>
          </div>

          {/* Inline notification */}
          <AlertBanner banner={banner} />

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                আপলোড হচ্ছে…
              </>
            ) : (
              "প্রোডাক্ট লাইভ করুন"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
