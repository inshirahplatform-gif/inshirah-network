"use client";

import { useState } from "react";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const faqs = [
  {
    category: "সাধারণ প্রশ্ন",
    questions: [
      {
        q: "ইনশিরাহ নেটওয়ার্ক কী?",
        a: "ইনশিরাহ নেটওয়ার্ক একটি শতভাগ হালাল ও শারিয়াহ-সম্মত ই-কমার্স প্ল্যাটফর্ম যেখানে আপনি নিরাপদে কেনাকাটা করতে পারেন।",
      },
      {
        q: "কিভাবে অ্যাকাউন্ট তৈরি করব?",
        a: "আমাদের ওয়েবসাইটের নিবন্ধন পেজে গিয়ে আপনার তথ্য দিয়ে সহজেই অ্যাকাউন্ট তৈরি করতে পারেন।",
      },
      {
        q: "প্রোডাক্ট কিনতে কী কী লাগবে?",
        a: "অ্যাকাউন্ট তৈরি করে প্রোডাক্ট কার্টে যোগ করুন এবং চেকআউট করুন। পেমেন্ট সম্পন্ন করলেই অর্ডার কনফার্ম হবে।",
      },
    ],
  },
  {
    category: "পেমেন্ট",
    questions: [
      {
        q: "কোন পেমেন্ট মেথড গ্রহণ করা হয়?",
        a: "আমরা bKash, Nagad, Rocket, ব্যাংক ট্রান্সফার এবং ক্যাশ অন ডেলিভারি গ্রহণ করি।",
      },
      {
        q: "ইনস্টলমেন্ট সুবিধা আছে?",
        a: "হ্যাঁ, আমরা শরিয়াহ-সম্মত মুরাবাহা ও ইজারা ভিত্তিক ইনস্টলমেন্ট সুবিধা দিই।",
      },
      {
        q: "পেমেন্ট নিরাপদ?",
        a: "হ্যাঁ, আমাদের সব পেমেন্ট SSL এনক্রিপটেড এবং সম্পূর্ণ নিরাপদ।",
      },
    ],
  },
  {
    category: "ডেলিভারি",
    questions: [
      {
        q: "ডেলিভারি চার্জ কত?",
        a: "ঢাকার ভেতর ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।",
      },
      {
        q: "ডেলিভারি কত দিনে হয়?",
        a: "ঢাকার ভেতর ২-৩ দিন, ঢাকার বাইরে ৩-৫ দিন।",
      },
      {
        q: "অর্ডার ট্র্যাক করতে পারব?",
        a: "হ্যাঁ, আপনার অর্ডার হিস্ট্রি থেকে রিয়েল-টাইম ট্র্যাক করতে পারবেন।",
      },
    ],
  },
  {
    category: "রিটার্ন ও রিফান্ড",
    questions: [
      {
        q: "প্রোডাক্ট রিটার্ন করতে পারব?",
        a: "হ্যাঁ, ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।",
      },
      {
        q: "রিফান্ড কত দিনে পাব?",
        a: "রিটার্ন প্রসেস হওয়ার ৫-৭ দিনের মধ্যে রিফান্ড পাবেন।",
      },
      {
        q: "কোন প্রোডাক্ট রিটার্ন করা যাবে না?",
        a: "ব্যবহৃত বা ড্যামেজ প্রোডাক্ট রিটার্ন করা যাবে না।",
      },
    ],
  },
  {
    category: "শরিয়াহ কমপ্লায়েন্স",
    questions: [
      {
        q: "সব প্রোডাক্ট হালাল?",
        a: "হ্যাঁ, আমরা শতভাগ হালাল ও শারিয়াহ-সম্মত প্রোডাক্ট বিক্রি করি।",
      },
      {
        q: "ইনস্টলমেন্টে সুদ আছে?",
        a: "না, আমাদের ইনস্টলমেন্ট সম্পূর্ণ সুদ-মুক্ত এবং শরিয়াহ-সম্মত।",
      },
      {
        q: "আপনার ব্যবসা শরিয়াহ-সম্মত?",
        a: "হ্যাঁ, আমাদের ব্যবসা মডেল শরিয়াহ বিশেষজ্ঞদের দ্বারা যাচাইকৃত।",
      },
    ],
  },
];

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-950`}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            সাধারণ প্রশ্নাবলী
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            আপনার সব প্রশ্নের উত্তর এখানে পাবেন
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqs.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => setOpenCategory(categoryIndex)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-zinc-800"
              >
                <h2 className="text-lg font-semibold text-zinc-50">
                  {category.category}
                </h2>
                <svg
                  className={`h-5 w-5 text-zinc-400 transition-transform ${
                    openCategory === categoryIndex ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Questions */}
              {openCategory === categoryIndex && (
                <div className="border-t border-zinc-800">
                  {category.questions.map((faq, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="border-b border-zinc-800 last:border-0"
                    >
                      <button
                        onClick={() =>
                          setOpenQuestion(
                            openQuestion === questionIndex ? null : questionIndex
                          )
                        }
                        className="flex w-full items-start justify-between px-6 py-4 text-left transition-colors hover:bg-zinc-800/50"
                      >
                        <span className="flex-1 pr-4 text-sm font-medium text-zinc-50">
                          {faq.q}
                        </span>
                        <svg
                          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
                            openQuestion === questionIndex ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {openQuestion === questionIndex && (
                        <div className="px-6 pb-4">
                          <p className="text-sm text-zinc-400">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-6 text-center">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4">
            আরও প্রশ্ন আছে?
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            আমাদের সাথে যোগাযোগ করুন, আমরা সাহায্য করতে প্রস্তুত
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            যোগাযোগ করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
