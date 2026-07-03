import type { Metadata } from "next";

export const metadata: Metadata = { title: "শারীয়াহ নীতিমালা" };

const SECTIONS = [
  { number: "০১", title: "চুক্তির প্রকৃতি — জু'আলাহ ও দালালি", body: "ইনশিরাহ প্ল্যাটফর্মে মার্চেন্ট ও প্রমোটারের সম্পর্ক ইসলামি ফিকহের জু'আলাহ (নির্দিষ্ট কাজ সম্পন্নের বিনিময়ে পূর্বনির্ধারিত পারিশ্রমিক) এবং দালালি (মধ্যস্থতাকারী বা ব্রোকার) ব্যবস্থার আলোকে গঠিত। এই চুক্তি শরীয়াহ পণ্ডিতদের দ্বারা পর্যালোচিত এবং অনুমোদিত।" },
  { number: "০২", title: "হালাল পণ্য ও সেবার শর্ত", body: "প্রমোটার কেবলমাত্র শরীয়াহ-সম্মত ও প্ল্যাটফর্মে অনুমোদিত পণ্য বা সেবার প্রচার করতে পারবেন। নিম্নলিখিত পণ্য/সেবা কঠোরভাবে নিষিদ্ধ: মদ বা মাদক, সুদ-ভিত্তিক আর্থিক পণ্য, জুয়া বা লটারি সম্পর্কিত সেবা, অশ্লীল বিষয়বস্তু এবং যেকোনো প্রতারণামূলক পণ্য।" },
  { number: "০৩", title: "ফিজিক্যাল স্টক ও মালিকানার বাধ্যবাধকতা", body: "শরীয়াহর দৃষ্টিতে এমন পণ্য বিক্রি করা নিষিদ্ধ যা বিক্রেতার কাছে বিদ্যমান নয়। তাই ইনশিরাহতে প্রতিটি মার্চেন্টকে শুধুমাত্র তাদের ফিজিক্যাল স্টকে বা সরাসরি মালিকানায় থাকা পণ্যই তালিকাভুক্ত করতে হবে। স্টক শূন্য হলে পণ্যটি স্বয়ংক্রিয়ভাবে লুকিয়ে যাবে।" },
  { number: "০৪", title: "পারিশ্রমিক ও ঘারার পরিহার", body: "কমিশন কেবলমাত্র সফল ও যাচাইকৃত ডেলিভারির ভিত্তিতে প্রদান করা হবে। প্রমোটার প্রতিটি বিক্রয়ে কমিশনের ৮০% পাবেন এবং বাকি ২০% প্ল্যাটফর্ম পরিচালনা ব্যয় হিসেবে রাখা হবে — এই হার সম্পূর্ণ স্বচ্ছ ও পূর্বনির্ধারিত।" },
  { number: "০৫", title: "স্বচ্ছতা ও সততার দায়িত্ব", body: "প্রমোটারকে তাদের অ্যাফিলিয়েট সম্পর্ক প্রকাশ্যে জানাতে হবে। ভুয়া তথ্য, বিভ্রান্তিমূলক বিজ্ঞাপন, কৃত্রিম ক্লিক বা নকল রূপান্তর সম্পূর্ণ নিষিদ্ধ এবং অ্যাকাউন্ট বাতিলের কারণ হতে পারে।" },
  { number: "০৬", title: "প্ল্যাটফর্মের ভূমিকা ও সীমাবদ্ধতা", body: "ইনশিরাহ একটি মধ্যস্থতাকারী প্ল্যাটফর্ম। মার্চেন্টের পণ্য বা সেবার শরীয়াহ-সম্মতির চূড়ান্ত যাচাই মার্চেন্টের নিজস্ব দায়িত্ব। তবে প্ল্যাটফর্ম প্রাথমিক যাচাই ও নীতিমালা প্রয়োগ করে।" },
  { number: "০৭", title: "চুক্তি বাতিল ও বকেয়া পরিশোধ", body: "যেকোনো পক্ষ প্ল্যাটফর্মের শর্তানুযায়ী সম্পর্ক বাতিল করতে পারে। বকেয়া হালাল পারিশ্রমিক ন্যায়সঙ্গতভাবে নিষ্পত্তি করা হবে।" },
];

export default function ShariahPolicyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-4xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">শরীয়াহ কমপ্লায়েন্স</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">শারীয়াহ নীতিমালা</h1>
          <p className="mt-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
            ইনশিরাহ প্ল্যাটফর্মে পরিচালিত সকল অংশীদারিত্ব, কমিশন এবং পণ্যের
            যোগ্যতা নির্ধারণে যে শরীয়াহ নীতিমালা অনুসরণ করা হয় তার বিবরণ নিচে দেওয়া হলো।
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            ⚠️ গুরুত্বপূর্ণ: প্ল্যাটফর্মে নিবন্ধন বা পণ্য তালিকাভুক্তির মাধ্যমে
            আপনি নিচের সকল শর্ত মেনে নিচ্ছেন বলে গণ্য হবে।
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.number} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-4">
                <span className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {section.number}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{section.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-sm text-emerald-800 dark:text-emerald-300/80">
            এই নীতিমালা পরিবর্তনের অধিকার ইনশিরাহ কর্তৃপক্ষ সংরক্ষণ করে।
            যেকোনো পরিবর্তনের ক্ষেত্রে নিবন্ধিত ব্যবহারকারীদের ইমেইলে অবহিত করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
