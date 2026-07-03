import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
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
          href="/promoter/register"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
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
    </div>
  );
}
