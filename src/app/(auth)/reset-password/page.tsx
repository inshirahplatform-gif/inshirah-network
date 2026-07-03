"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>
      <span className="mt-0.5 shrink-0">{banner.type === "success" ? "✓" : "✕"}</span>
      <span>{banner.text}</span>
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const role = searchParams.get("role") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !role || !["promoter", "merchant"].includes(role)) {
      setBanner({
        type: "error",
        text: "রিসেট লিংকটি অবৈধ বা মেয়াদ শেষ। নতুন লিংকের জন্য পুনরায় অনুরোধ করুন।",
      });
    }
  }, [token, role]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = "নতুন পাসওয়ার্ড প্রদান করুন";
    else if (newPassword.length < 8) e.newPassword = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    if (!confirmPassword) e.confirmPassword = "পাসওয়ার্ড নিশ্চিত করুন";
    else if (newPassword !== confirmPassword) e.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, role, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setBanner({ type: "success", text: data.message });
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setBanner({ type: "error", text: data.error ?? "সমস্যা হয়েছে।" });
      }
    } catch {
      setBanner({ type: "error", text: "নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const inputOk = "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500";
  const inputErr = "border-red-500/50 focus-visible:outline-red-500";

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/50 text-2xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-zinc-50">নতুন পাসওয়ার্ড সেট করুন</h1>
        <p className="mt-2 text-sm text-zinc-400">
          আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী পাসওয়ার্ড বেছে নিন
        </p>
      </div>

      {!done ? (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300">
              নতুন পাসওয়ার্ড <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })); }}
              placeholder="ন্যূনতম ৮ অক্ষর"
              disabled={isLoading || !token}
              className={`${inputBase} ${errors.newPassword ? inputErr : inputOk}`}
            />
            {errors.newPassword && <p className="text-sm text-red-400">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              placeholder="পাসওয়ার্ড আবার লিখুন"
              disabled={isLoading || !token}
              className={`${inputBase} ${errors.confirmPassword ? inputErr : inputOk}`}
            />
            {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>

          <AlertBanner banner={banner} />

          <button
            type="submit"
            disabled={isLoading || !token}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                সংরক্ষণ হচ্ছে…
              </>
            ) : (
              "পাসওয়ার্ড পরিবর্তন করুন"
            )}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-6 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-4 text-sm font-medium text-emerald-300">{banner?.text}</p>
          <p className="mt-2 text-xs text-zinc-500">৩ সেকেন্ডের মধ্যে লগ-ইন পেজে নিয়ে যাওয়া হবে…</p>
        </div>
      )}

      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-emerald-400 transition-colors">
          ← লগ-ইন পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <Suspense fallback={
          <div className="text-sm text-zinc-400">লোড হচ্ছে…</div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
