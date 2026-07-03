"use client";

import { useState } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"] });

type Banner = { type: "success" | "error"; text: string } | null;
type Role = "promoter" | "merchant";

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

export default function ForgotPasswordPage() {
  const [role, setRole] = useState<Role>("promoter");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setEmailError("");
    if (!email.trim()) { setEmailError("ইমেইল ঠিকানা প্রদান করুন"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("সঠিক ইমেইল ঠিকানা লিখুন"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();
      if (res.ok) { setBanner({ type: "success", text: data.message }); setSent(true); }
      else setBanner({ type: "error", text: data.error ?? "সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } catch {
      setBanner({ type: "error", text: "নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally { setIsLoading(false); }
  };

  const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
      <div className="fixed right-4 top-4 z-50"><ThemeToggle /></div>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-950/50">🔑</div>
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">আপনার নিবন্ধিত ইমেইলে রিসেট লিংক পাঠানো হবে</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                {(["promoter", "merchant"] as Role[]).map((r) => (
                  <button key={r} type="button" onClick={() => { setRole(r); setBanner(null); }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${role === r ? "bg-emerald-700 text-white" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"}`}
                  >
                    {r === "promoter" ? "প্রমোটার" : "মার্চেন্ট"}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  নিবন্ধিত ইমেইল ঠিকানা <span className="text-red-500">*</span>
                </label>
                <input type="email" id="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); setBanner(null); }}
                  placeholder="example@email.com" disabled={isLoading}
                  className={`${inputBase} ${emailError ? "border-red-400 focus-visible:outline-red-500 dark:border-red-500/50" : "border-zinc-300 focus-visible:border-emerald-500 focus-visible:outline-emerald-500 dark:border-zinc-700"}`}
                />
                {emailError && <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>}
              </div>

              <AlertBanner banner={banner} />

              <button type="submit" disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (<><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>পাঠানো হচ্ছে…</>) : "রিসেট লিংক পাঠান"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <p className="text-4xl">📧</p>
              <p className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-300">{banner?.text}</p>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-600">ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করুন। লিংক ১ ঘণ্টা বৈধ।</p>
              <button type="button" onClick={() => { setSent(false); setEmail(""); setBanner(null); }}
                className="mt-5 text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                অন্য ইমেইল দিয়ে চেষ্টা করুন
              </button>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400">
              ← লগ-ইন পেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
