"use client";

import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import { FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const JUALAH_SUMMARY = [
  {
    title: "১. চুক্তির প্রকৃতি",
    body: "ইনশিরাহ প্ল্যাটফর্মে প্রমোটার ও মার্চেন্টের সম্পর্ক জু'আলাহ (নির্দিষ্ট কাজ সম্পন্নের বিনিময়ে পূর্বনির্ধারিত পারিশ্রমিক) এবং দালালি (সাধনযোগ্য ক্রেতা বা গ্রাহক সংযোগ) ব্যবস্থার আলোকে গঠিত।",
  },
  {
    title: "২. হালাল পণ্য ও সেবা",
    body: "প্রমোটার কেবলমাত্র শরীয়াহ-সম্মত ও প্ল্যাটফর্মে অনুমোদিত পণ্য/সেবার প্রচার করবেন। হারাম, সুদভিত্তিক, জুয়া, অশ্লীল বা প্রতারণামূলক পণ্যের প্রচার কঠোরভাবে নিষিদ্ধ।",
  },
  {
    title: "৩. স্বচ্ছতা ও সততা",
    body: "অ্যাফিলিয়েট সম্পর্ক স্পষ্টভাবে প্রকাশ করতে হবে। ভুয়া তথ্য, প্রতারণামূলক বিজ্ঞাপন, কৃত্রিম ক্লিক বা রূপান্তর তৈরি করা যাবে না।",
  },
  {
    title: "৪. পারিশ্রমিক ও ঘারার পরিহার",
    body: "নির্ধারিত কমিশন কেবলমাত্র সফল ও যাচাইকৃত রূপান্তরের ভিত্তিতে প্রদান করা হবে। অনিশ্চিত, অস্পষ্ট বা দ্ব্যর্থক শর্তে চুক্তি গ্রহণযোগ্য নয়।",
  },
  {
    title: "৫. প্ল্যাটফর্মের ভূমিকা",
    body: "ইনশিরাহ একটি মধ্যস্থতাকারী প্ল্যাটফর্ম। মার্চেন্টের পণ্য/সেবার শরীয়াহ-সম্মতির চূড়ান্ত যাচাই মার্চেন্টের দায়িত্ব; তবে প্ল্যাটফর্ম প্রাথমিক যাচাই ও নীতিমালা বলবৎ করে।",
  },
  {
    title: "৬. যোগাযোগ ও ত্যাগ",
    body: "হোয়াটসঅ্যাপসহ প্ল্যাটফর্মের অনুমোদিত মাধ্যমে যোগাযোগ রাখতে হবে। যেকোনো পক্ষ প্ল্যাটফর্মের শর্তানুযায়ী সম্পর্ক বাতিল করতে পারে; বকেয়া হালাল পারিশ্রমিক ন্যায়সঙ্গতভাবে নিষ্পত্তি করা হবে।",
  },
  {
    title: "৭. সম্মতি",
    body: "নিবন্ধন সম্পন্ন করে প্রমোটার উপরোক্ত শরীয়াহ নীতিমালা ও প্ল্যাটফর্মের শর্তাবলী মেনে চলতে বাধ্য থাকবেন।",
  },
] as const;

type FormValues = {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  agreedToShariah: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const inputClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 placeholder:text-zinc-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20";

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "পূর্ণ নাম প্রদান করুন।";
  }

  if (!values.email.trim()) {
    errors.email = "ইমেইল ঠিকানা প্রদান করুন।";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "সঠিক ইমেইল ঠিকানা লিখুন।";
  }

  const whatsappDigits = values.whatsapp.replace(/\D/g, "");
  if (!whatsappDigits) {
    errors.whatsapp = "হোয়াটসঅ্যাপ নম্বর প্রদান করুন।";
  } else if (!/^(?:8801\d{9}|01\d{9})$/.test(whatsappDigits)) {
    errors.whatsapp = "বাংলাদেশি মোবাইল নম্বর (০১XXXXXXXXX) লিখুন।";
  }

  if (!values.password) {
    errors.password = "পাসওয়ার্ড প্রদান করুন।";
  } else if (values.password.length < 8) {
    errors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "পাসওয়ার্ড নিশ্চিত করুন।";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না।";
  }

  if (!values.agreedToShariah) {
    errors.agreedToShariah = "শরীয়াহ নীতিমালায় সম্মতি দিতে হবে।";
  }

  return errors;
}

export default function PromoterRegisterPage() {
  const router = useRouter();
  const agreementId = useId();
  const [values, setValues] = useState<FormValues>({
    fullName: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
    agreedToShariah: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPolicy, setShowPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    document.title = "ইনশিরাহ নেটওয়ার্ক - প্রমোটার অ্যাকাউন্ট তৈরি করুন";
  }, []);

  function handleChange<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/promoter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          whatsapp: values.whatsapp.trim(),
          password: values.password,
          agreedToShariah: values.agreedToShariah,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "নিবন্ধন সম্পন্ন করা যায়নি।");
      }

      setSubmitMessage({
        type: "success",
        text: data.message ?? "আপনার প্রমোটার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।",
      });
      setValues({
        fullName: "",
        email: "",
        whatsapp: "",
        password: "",
        confirmPassword: "",
        agreedToShariah: false,
      });
      setShowPolicy(false);
      // Redirect to login after a short delay so the user sees the success message
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "একটি ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`${notoSansBengali.className} min-h-full bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-6 sm:py-16`}
    >
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-zinc-500 transition-colors hover:text-emerald-800 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          ← হোমে ফিরে যান
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
            প্রমোটার নিবন্ধন
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
            ইনশিরাহ নেটওয়ার্ক - প্রমোটার অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            হালাল উপায়ে আয়ের সুযোগ পেতে আপনার তথ্য দিন। যোগাযোগের জন্য
            হোয়াটসঅ্যাপ নম্বর অবশ্যই সঠিক দিন।
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                পূর্ণ নাম
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="আপনার পূর্ণ নাম লিখুন"
                value={values.fullName}
                onChange={(event) =>
                  handleChange("fullName", event.target.value)
                }
                className={inputClassName}
              />
              {errors.fullName ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                ইমেইল ঠিকানা
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={inputClassName}
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                হোয়াটসঅ্যাপ নম্বর
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                placeholder="০১XXXXXXXXX"
                value={values.whatsapp}
                onChange={(event) =>
                  handleChange("whatsapp", event.target.value)
                }
                className={inputClassName}
              />
              {errors.whatsapp ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.whatsapp}
                </p>
              ) : (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  গুরুত্বপূর্ণ: এই নম্বরে যোগাযোগ ও নোটিফিকেশন পাঠানো হবে।
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="ন্যূনতম ৮ অক্ষরের পাসওয়ার্ড"
                value={values.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                className={inputClassName}
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                নিশ্চিত পাসওয়ার্ড
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="পাসওয়ার্ড আবার লিখুন"
                value={values.confirmPassword}
                onChange={(event) =>
                  handleChange("confirmPassword", event.target.value)
                }
                className={inputClassName}
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/60">
              <div className="flex items-start gap-3">
                <input
                  id={agreementId}
                  type="checkbox"
                  checked={values.agreedToShariah}
                  onChange={(event) =>
                    handleChange("agreedToShariah", event.target.checked)
                  }
                  className="mt-1 size-4 shrink-0 rounded border-zinc-300 text-emerald-700 focus:ring-2 focus:ring-emerald-600/30 dark:border-zinc-600 dark:bg-zinc-900"
                />
                <label
                  htmlFor={agreementId}
                  className="text-sm leading-7 text-zinc-700 dark:text-zinc-300"
                >
                  আমি ইনশিরাহ প্ল্যাটফর্মের &quot;জু&apos;আলাহ ও দালালি&quot;
                  সংক্রান্ত{" "}
                  <button
                    type="button"
                    onClick={() => setShowPolicy((current) => !current)}
                    className="font-semibold text-emerald-800 underline decoration-emerald-800/40 underline-offset-2 transition-colors hover:text-emerald-900 dark:text-emerald-400 dark:decoration-emerald-400/40 dark:hover:text-emerald-300"
                  >
                    শরয়ী নীতিমালা
                  </button>{" "}
                  এবং শর্তাবলী মেনে অ্যাকাউন্ট তৈরি করতে সম্মত হচ্ছি।
                </label>
              </div>

              {errors.agreedToShariah ? (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {errors.agreedToShariah}
                </p>
              ) : null}

              {showPolicy ? (
                <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/50 dark:bg-zinc-900">
                  <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    জু&apos;আলাহ ও দালালি — সংক্ষিপ্ত শরীয়াহ নীতিমালা
                  </h2>
                  <div className="mt-3 space-y-4">
                    {JUALAH_SUMMARY.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                          {section.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {submitMessage ? (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  submitMessage.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                }`}
              >
                {submitMessage.text}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-800 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:focus-visible:outline-emerald-500"
            >
              {isSubmitting ? "প্রক্রিয়াকরণ হচ্ছে..." : "নিবন্ধন সম্পন্ন করুন"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
