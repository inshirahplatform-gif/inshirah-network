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

export default function MerchantRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    shariahAgreement: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) newErrors.businessName = "ব্যবসার নাম আবশ্যক";
    if (!formData.ownerName.trim()) newErrors.ownerName = "মালিকের নাম আবশ্যক";
    if (!formData.email.trim()) {
      newErrors.email = "ইমেইল আবশ্যক";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "সঠিক ইমেইল ঠিকানা দিন";
    }
    if (!formData.phone.trim()) newErrors.phone = "ফোন নম্বর আবশ্যক";
    if (!formData.password.trim()) {
      newErrors.password = "পাসওয়ার্ড আবশ্যক";
    } else if (formData.password.length < 8) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    }
    if (!formData.shariahAgreement) newErrors.shariahAgreement = "শরীয়াহ চুক্তিতে সম্মতি বাধ্যতামূলক";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          shariahAgreement: formData.shariahAgreement,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setBanner({ type: "success", text: data.message ?? "মার্চেন্ট অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" });
        setFormData({ businessName: "", ownerName: "", email: "", phone: "", password: "", shariahAgreement: false });
        setErrors({});
      } else {
        setBanner({ type: "error", text: data.error ?? "নিবন্ধন সম্পন্ন করা যায়নি" });
      }
    } catch {
      setBanner({ type: "error", text: "নিবন্ধনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setBanner(null);
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const inputOk = "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500";
  const inputErr = "border-red-500/50 focus-visible:outline-red-500";

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-50">মার্চেন্ট অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="mt-3 text-sm text-zinc-400">ইনশিরাহ প্ল্যাটফর্মে আপনার ব্যবসা যুক্ত করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Business Name */}
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-zinc-300">
                ব্যবসা বা ব্র্যান্ডের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text" id="businessName" name="businessName"
                value={formData.businessName} onChange={handleChange}
                placeholder="আপনার ব্যবসার নাম লিখুন" disabled={isLoading}
                className={`${inputBase} ${errors.businessName ? inputErr : inputOk}`}
              />
              {errors.businessName && <p className="text-sm text-red-400">{errors.businessName}</p>}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-300">
                মালিকের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text" id="ownerName" name="ownerName"
                value={formData.ownerName} onChange={handleChange}
                placeholder="মালিকের নাম লিখুন" disabled={isLoading}
                className={`${inputBase} ${errors.ownerName ? inputErr : inputOk}`}
              />
              {errors.ownerName && <p className="text-sm text-red-400">{errors.ownerName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                ইমেইল ঠিকানা <span className="text-red-400">*</span>
              </label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="example@email.com" disabled={isLoading}
                className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300">
                ফোন নম্বর <span className="text-red-400">*</span>
              </label>
              <input
                type="tel" id="phone" name="phone"
                value={formData.phone} onChange={handleChange}
                placeholder="017XXXXXXXXX" disabled={isLoading}
                className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
              />
              {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                পাসওয়ার্ড <span className="text-red-400">*</span>
              </label>
              <input
                type="password" id="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="কমপক্ষে ৮ অক্ষর" disabled={isLoading}
                className={`${inputBase} ${errors.password ? inputErr : inputOk}`}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Shariah Agreement */}
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox" id="shariahAgreement" name="shariahAgreement"
                  checked={formData.shariahAgreement} onChange={handleChange}
                  disabled={isLoading}
                  className={`mt-1 h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${errors.shariahAgreement ? "border-red-500" : ""}`}
                />
                <span className="text-sm text-zinc-300">
                  আমি সাক্ষ্য দিচ্ছি যে, ইনশিরাহ প্ল্যাটফর্মে আমি কেবল সেই পণ্যগুলোই
                  লিস্টিং করব যা আমার ফিজিক্যাল স্টকে বা সরাসরি মালিকানায় বিদ্যমান।
                  অনুপস্থিত বা অবাস্তব পণ্য বিক্রি করার শরয়ী দায়ভার সম্পূর্ণ আমার।
                </span>
              </label>
              {errors.shariahAgreement && (
                <p className="text-sm text-red-400">{errors.shariahAgreement}</p>
              )}
            </div>

            {/* Inline notification */}
            <AlertBanner banner={banner} />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  প্রক্রিয়াকরণ হচ্ছে…
                </>
              ) : (
                "মার্চেন্ট অ্যাকাউন্ট তৈরি করুন"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-zinc-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <a href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                লগইন করুন
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
