import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
      <p className="text-sm font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
        দ্বীনি অ্যাফিলিয়েট নেটওয়ার্ক
      </p>
      <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl sm:leading-tight lg:text-5xl dark:text-zinc-50">
        ইনশিরাহ-এর সাথে হালাল উপায়ে ব্যবসার প্রসার ও আয় করুন
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg dark:text-zinc-400">
        শতভাগ শারীয়াহ-সম্মত আইনি ফ্রেমওয়ার্ক এবং আধুনিক ট্র্যাকিং প্রযুক্তির
        সমন্বয়ে গঠিত বাংলাদেশের প্রথম ডেডিকেটেড দ্বীনি মেগা-অ্যাফিলিয়েট
        নেটওয়ার্ক।
      </p>
      
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          প্রোডাক্ট দেখুন
        </Link>
        <Link
          href="/promoter/register"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-transparent px-7 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-600 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
        >
          প্রমোটার হিসেবে যোগ দিন
        </Link>
        <Link
          href="/merchant/register"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-transparent px-7 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-600 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
        >
          মার্চেন্ট হিসেবে যোগ দিন
        </Link>
      </div>

      {/* Info Cards */}
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
            <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            ক্রেতা হিসেবে
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            রেজিস্ট্রেশন ছাড়াই প্রোডাক্ট দেখুন এবং অর্ডার করুন। সব প্রোডাক্ট শারীয়াহ-সম্মত।
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            প্রমোটার হিসেবে
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            প্রোডাক্ট প্রচার করে কমিশন আয় করুন। প্রতি বিক্রয়ে ৮০% কমিশন পাবেন।
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            মার্চেন্ট হিসেবে
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            আপনার প্রোডাক্ট আপলোড করুন এবং প্রমোটারদের মাধ্যমে বিক্রি বাড়ান।
          </p>
        </div>
      </div>
    </div>
  );
}
