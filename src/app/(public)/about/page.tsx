import type { Metadata } from "next";

export const metadata: Metadata = { title: "আমাদের সম্পর্কে" };

const PILLARS = [
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), 
    title: "শারীয়াহ-সম্মত ভিত্তি", 
    body: "প্রতিটি লেনদেন জু'আলাহ ও দালালি নীতিমালার আলোকে পরিচালিত। সুদ, ঘারার ও হারাম পণ্য থেকে সম্পূর্ণ মুক্ত।" 
  },
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), 
    title: "স্বচ্ছ অংশীদারিত্ব", 
    body: "মার্চেন্ট ও প্রমোটারের মধ্যে স্পষ্ট চুক্তি। প্রতিটি কমিশন যাচাইকৃত বিক্রয়ের ভিত্তিতে নির্ধারিত।" 
  },
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ), 
    title: "ফিজিক্যাল স্টক বাধ্যতামূলক", 
    body: "শুধুমাত্র বাস্তবে মজুদ পণ্যই প্ল্যাটফর্মে তালিকাভুক্ত হতে পারে। স্টক শেষ হলে পণ্য স্বয়ংক্রিয়ভাবে বন্ধ হয়।" 
  },
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), 
    title: "ন্যায্য আয় বণ্টন", 
    body: "ডেলিভারি নিশ্চিত হলে প্রমোটার কমিশনের ৮০% পান। বাকি ২০% প্ল্যাটফর্ম পরিচালনা ব্যয়ে ব্যবহৃত হয়।" 
  },
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ), 
    title: "নিরাপদ প্রযুক্তি", 
    body: "আধুনিক JWT-ভিত্তিক নিরাপত্তা, এনক্রিপ্টেড পাসওয়ার্ড এবং role-based access control দিয়ে সুরক্ষিত।" 
  },
  { 
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ), 
    title: "দ্বীনি উদ্যোগ", 
    body: "বাংলাদেশের মুসলিম উদ্যোক্তা ও প্রচারকদের জন্য হালাল উপায়ে আয়ের সুযোগ তৈরিই আমাদের লক্ষ্য।" 
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">আমাদের সম্পর্কে</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            ইনশিরাহ নেটওয়ার্ক
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            বাংলাদেশের প্রথম শারীয়াহ-সম্মত ডেডিকেটেড অ্যাফিলিয়েট নেটওয়ার্ক।
            আমরা বিশ্বাসযোগ্য মার্চেন্ট ও প্রমোটারদের একটি স্বচ্ছ, জবাবদিহিমূলক এবং
            ঈমান-সচেতন বাণিজ্যিক প্ল্যাটফর্মে একত্রিত করি।
          </p>
        </div>

        <div className="my-12 border-t border-zinc-200 dark:border-zinc-800" />

        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">আমাদের মূলনীতি</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800/50">
                <div className="text-emerald-700 dark:text-emerald-400">{pillar.icon}</div>
                <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-zinc-50">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="my-12 border-t border-zinc-200 dark:border-zinc-800" />

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-500">আমাদের লক্ষ্য</p>
          <blockquote className="mt-4 text-lg leading-8 text-emerald-900 dark:text-emerald-200/80">
            &ldquo;হালাল উপায়ে রিজিক তালাশ করা প্রত্যেক মুসলমানের দায়িত্ব।
            ইনশিরাহ সেই পথকে সহজ, স্বচ্ছ ও প্রযুক্তি-সমৃদ্ধ করতে প্রতিশ্রুতিবদ্ধ।&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400/60">— ইনশিরাহ নেটওয়ার্ক টিম</p>
        </div>
      </div>
    </div>
  );
}
