"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"] });

type Banner = { type: "success" | "error"; text: string } | null;

function AlertBanner({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const styles = banner.type === "success"
    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300";
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>
      <span className="mt-0.5 shrink-0">{banner.type === "success" ? "✓" : "✕"}</span>
      <span>{banner.text}</span>
    </div>
  );
}

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ businessName: "", ownerName: "", email: "", phone: "", password: "", shariahAgreement: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.businessName.trim()) e.businessName = "ব্যবসার নাম আবশ্যক";
    if (!formData.ownerName.trim()) e.ownerName = "মালিকের নাম আবশ্যক";
    if (!formData.email.trim()) e.email = "ইমেইল আবশ্যক";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "সঠিক ইমেইল ঠিকানা দিন";
    if (!formData.phone.trim()) e.phone = "ফোন নম্বর আবশ্যক";
    if (!formData.password.trim()) e.password = "পাসওয়ার্ড আবশ্যক";
    else if (formData.password.length < 8) e.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    if (!formData.shariahAgreement) e.shariahAgreement = "শরীয়াহ চুক্তিতে সম্মতি বাধ্যতামূলক";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/merchant/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: formData.businessName, ownerName: formData.ownerName, email: formData.email, phone: formData.phone, password: formData.password, shariahAgreement: formData.shariahAgreement }),
      });
      const data = await response.json();
      if (response.ok) {
        setBanner({ type: "success", text: data.message ?? "মার্চেন্ট অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" });
        setFormData({ businessName: "", ownerName: "", email: "", phone: "", password: "", shariahAgreement: false });
        setErrors({});
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setBanner({ type: "error", text: data.error ?? "নিবন্ধন সম্পন্ন করা যায়নি" });
      }
    } catch {
      setBanner({ type: "error", text: "নিবন্ধনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally { setIsLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setBanner(null);
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-50";
  const inputOk = "border-zinc-300 focus-visible:border-emerald-500 focus-visible:outline-emerald-500 dark:border-zinc-700";
  const inputErr = "border-red-400 focus-visible:outline-red-500 dark:border-red-500/50";

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
      <div className="fixed right-4 top-4 z-50"><ThemeToggle /></div>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">মার্চেন্ট অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">ইনশিরাহ প্ল্যাটফর্মে আপনার ব্যবসা যুক্ত করুন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {[
              { id: "businessName", label: "ব্যবসা বা ব্র্যান্ডের নাম", placeholder: "আপনার ব্যবসার নাম লিখুন", type: "text" },
              { id: "ownerName", label: "মালিকের নাম", placeholder: "মালিকের নাম লিখুন", type: "text" },
              { id: "email", label: "ইমেইল ঠিকানা", placeholder: "example@email.com", type: "email" },
              { id: "phone", label: "ফোন নম্বর", placeholder: "017XXXXXXXXX", type: "tel" },
              { id: "password", label: "পাসওয়ার্ড", placeholder: "কমপক্ষে ৮ অক্ষর", type: "password" },
            ].map(({ id, label, placeholder, type }) => (
              <div key={id} className="space-y-2">
                <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input type={type} id={id} name={id}
                  value={formData[id as keyof typeof formData] as string}
                  onChange={handleChange} placeholder={placeholder} disabled={isLoading}
                  className={`${inputBase} ${errors[id] ? inputErr : inputOk}`}
                />
                {errors[id] && <p className="text-sm text-red-600 dark:text-red-400">{errors[id]}</p>}
              </div>
            ))}

            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" id="shariahAgreement" name="shariahAgreement"
                  checked={formData.shariahAgreement} onChange={handleChange} disabled={isLoading}
                  className={`mt-1 h-5 w-5 rounded border-zinc-300 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 ${errors.shariahAgreement ? "border-red-400" : ""}`}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                  আমি সাক্ষ্য দিচ্ছি যে, ইনশিরাহ প্ল্যাটফর্মে আমি কেবল সেই পণ্যগুলোই
                  লিস্টিং করব যা আমার ফিজিক্যাল স্টকে বা সরাসরি মালিকানায় বিদ্যমান।
                </span>
              </label>
              {errors.shariahAgreement && <p className="text-sm text-red-600 dark:text-red-400">{errors.shariahAgreement}</p>}
            </div>

            <AlertBanner banner={banner} />

            <button type="submit" disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (<><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>প্রক্রিয়াকরণ হচ্ছে…</>) : "মার্চেন্ট অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <a href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">লগইন করুন</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
