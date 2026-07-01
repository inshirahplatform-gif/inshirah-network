"use client";

import { useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import { useRouter } from "next/navigation";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

type UserRole = "promoter" | "merchant" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("promoter");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "ইমেইল আবশ্যক";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "সঠিক ইমেইল ঠিকানা দিন";
    }

    if (!formData.password.trim()) {
      newErrors.password = "পাসওয়ার্ড আবশ্যক";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          // Redirect based on role
          if (role === "promoter") {
            router.push("/promoter/dashboard");
          } else if (role === "merchant") {
            router.push("/merchant/dashboard");
          } else if (role === "admin") {
            router.push("/admin/dashboard");
          }
        } else {
          alert(data.error || "লগ-ইন ব্যর্থ হয়েছে");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("লগ-ইনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
              ইনশিরাহ প্ল্যাটফর্মে লগ-ইন করুন
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              আপনার অ্যাকাউন্টে প্রবেশ করুন
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
            {[
              { value: "promoter", label: "প্রমোটার" },
              { value: "merchant", label: "মার্চেন্ট" },
              { value: "admin", label: "অ্যাডমিন" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value as UserRole)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  role === option.value
                    ? "bg-emerald-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isLoading}
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.email
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
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
                placeholder="আপনার পাসওয়ার্ড"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-zinc-50 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.password
                    ? "border-red-500/50 focus-visible:outline-red-500"
                    : "border-zinc-800 focus-visible:border-emerald-700 focus-visible:outline-emerald-500"
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "লোড হচ্ছে..." : "প্রবেশ করুন"}
            </button>
          </form>

          {/* Registration Links */}
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              নতুন অ্যাকাউন্ট তৈরি করুন?{" "}
              <a
                href="/promoter/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                প্রমোটার হিসেবে
              </a>{" "}
              /{" "}
              <a
                href="/merchant/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                মার্চেন্ট হিসেবে নিবন্ধিত হোন
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
