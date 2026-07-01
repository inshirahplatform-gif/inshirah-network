"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "ব্যবসার নাম আবশ্যক";
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "মালিকের নাম আবশ্যক";
    }

    if (!formData.email.trim()) {
      newErrors.email = "ইমেইল আবশ্যক";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "সঠিক ইমেইল ঠিকানা দিন";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "ফোন নম্বর আবশ্যক";
    }

    if (!formData.password.trim()) {
      newErrors.password = "পাসওয়ার্ড আবশ্যক";
    } else if (formData.password.length < 8) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    }

    if (!formData.shariahAgreement) {
      newErrors.shariahAgreement = "শরীয়াহ চুক্তিতে সম্মতি বাধ্যতামূলক";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch("/api/merchant/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          alert(data.message);
          // Reset form
          setFormData({
            businessName: "",
            ownerName: "",
            email: "",
            phone: "",
            password: "",
            shariahAgreement: false,
          });
        } else {
          alert(data.error || "নিবন্ধন সম্পন্ন করা যায়নি");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("নিবন্ধনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-50">
              মার্চেন্ট অ্যাকাউন্ট তৈরি করুন
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              ইনশিরাহ প্ল্যাটফর্মে আপনার ব্যবসা যুক্ত করুন
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-zinc-300"
              >
                ব্যবসা বা ব্র্যান্ডের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="আপনার ব্যবসার নাম লিখুন"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  errors.businessName
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.businessName && (
                <p className="text-sm text-red-400">{errors.businessName}</p>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-zinc-300"
              >
                মালিকের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="মালিকের নাম লিখুন"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  errors.ownerName
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.ownerName && (
                <p className="text-sm text-red-400">{errors.ownerName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300"
              >
                ইমেইল ঠিকানা <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  errors.email
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-zinc-300"
              >
                ফোন নম্বর <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="017XXXXXXXXX"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  errors.phone
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                পাসওয়ার্ড <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="কমপক্ষে ৮ অক্ষর"
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  errors.password
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Shariah Agreement Checkbox */}
            <div className="space-y-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shariahAgreement"
                  name="shariahAgreement"
                  checked={formData.shariahAgreement}
                  onChange={handleChange}
                  className={`mt-1 h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                    errors.shariahAgreement ? "border-red-500" : ""
                  }`}
                />
                <span className="text-sm text-zinc-300">
                  আমি সাক্ষ্য দিচ্ছি যে, ইনশিরাহ প্ল্যাটফর্মে আমি কেবল সেই পণ্যগুলোই
                  লিস্টিং করব যা আমার ফিজিক্যাল স্টকে বা সরাসরি মালিকানায়
                  বিদ্যমান। অনুপস্থিত বা অবাস্তব পণ্য বিক্রি করার শরয়ী দায়ভার
                  সম্পূর্ণ আমার।
                </span>
              </label>
              {errors.shariahAgreement && (
                <p className="text-sm text-red-400">{errors.shariahAgreement}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              মার্চেন্ট অ্যাকাউন্ট তৈরি করুন
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-zinc-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <a
                href="/merchant/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                লগইন করুন
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
