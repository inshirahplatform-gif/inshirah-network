"use client";

import { useState } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type UserRole = "promoter" | "merchant" | "admin";
type Banner = { type: "success" | "error"; text: string } | null;

function AlertBanner({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const styles =
    banner.type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300";
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>
      <span className="mt-0.5 shrink-0">{banner.type === "success" ? "✓" : "✕"}</span>
      <span>{banner.text}</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("promoter");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "ইমেইল আবশ্যক";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "সঠিক ইমেইল ঠিকানা দিন";
    if (!formData.password.trim()) newErrors.password = "পাসওয়ার্ড আবশ্যক";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        setBanner({ type: "success", text: data.message ?? "লগ-ইন সফল হয়েছে!" });
        setTimeout(() => {
          if (role === "promoter") router.push("/promoter/dashboard");
          else if (role === "merchant") router.push("/merchant/dashboard");
          else router.push("/admin/dashboard");
        }, 800);
      } else {
        setBanner({ type: "error", text: data.error ?? "লগ-ইন ব্যর্থ হয়েছে" });
      }
    } catch {
      setBanner({ type: "error", text: "লগ-ইনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBanner(null);
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-50";
  const inputOk = "border-zinc-300 focus-visible:border-emerald-500 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:focus-visible:border-emerald-600 dark:focus-visible:outline-emerald-500";
  const inputErr = "border-red-400 focus-visible:outline-red-500 dark:border-red-500/50";

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
      {/* Theme toggle top-right */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">
              ইনশিরাহ প্ল্যাটফর্মে লগ-ইন করুন
            </h1>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            {(["promoter", "merchant", "admin"] as const).map((r) => (
              <button key={r} type="button" onClick={() => { setRole(r); setBanner(null); }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  role === r ? "bg-emerald-700 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                }`}
              >
                {r === "promoter" ? "প্রমোটার" : r === "merchant" ? "মার্চেন্ট" : "অ্যাডমিন"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ইমেইল ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="example@email.com" disabled={isLoading}
                className={`${inputBase} ${errors.email ? inputErr : inputOk}`} />
              {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="আপনার পাসওয়ার্ড" disabled={isLoading}
                className={`${inputBase} ${errors.password ? inputErr : inputOk}`} />
              {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <AlertBanner banner={banner} />

            <button type="submit" disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>লোড হচ্ছে…</>
              ) : "প্রবেশ করুন"}
            </button>
          </form>

          <div className="space-y-3 text-center">
            <Link href="/forgot-password" className="block text-sm font-medium text-zinc-400 transition-colors hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              নতুন অ্যাকাউন্ট তৈরি করুন?{" "}
              <Link href="/promoter/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">প্রমোটার হিসেবে</Link>{" "}
              /{" "}
              <Link href="/merchant/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">মার্চেন্ট হিসেবে নিবন্ধিত হোন</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
