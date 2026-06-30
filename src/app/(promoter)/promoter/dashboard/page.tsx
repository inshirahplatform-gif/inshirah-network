import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const MOCK_BALANCES = {
  totalEarned: 1200,
  pendingBalance: 300,
  availableBalance: 900,
} as const;

const MIN_WITHDRAWAL = 500;

function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatCardProps = {
  label: string;
  value: string;
  accent?: "emerald" | "amber" | "sky";
};

function StatCard({ label, value, accent = "emerald" }: StatCardProps) {
  const accentClasses = {
    emerald: "from-emerald-500/15 to-transparent text-emerald-400",
    amber: "from-amber-500/15 to-transparent text-amber-400",
    sky: "from-sky-500/15 to-transparent text-sky-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentClasses[accent]}`}
      />
      <p className="relative text-sm font-medium text-zinc-400">{label}</p>
      <p className="relative mt-3 text-3xl font-bold tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}

export default function PromoterDashboardPage() {
  const canWithdraw = MOCK_BALANCES.availableBalance >= MIN_WITHDRAWAL;

  return (
    <div className={`${notoSansBengali.className} space-y-8`}>
      <section>
        <p className="text-sm font-semibold text-emerald-400">প্রমোটার প্যানেল</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          স্বাগতম, আপনার ড্যাশবোর্ড
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          আপনার আয়, ব্যালেন্স ও উত্তোলনের তথ্য এক জায়গায় দেখুন এবং নতুন
          প্রোডাক্ট খুঁজে প্রচার শুরু করুন।
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="মোট আয়"
          value={formatBdt(MOCK_BALANCES.totalEarned)}
          accent="emerald"
        />
        <StatCard
          label="পেন্ডিং ব্যালেন্স"
          value={formatBdt(MOCK_BALANCES.pendingBalance)}
          accent="amber"
        />
        <StatCard
          label="উত্তোলনযোগ্য ব্যালেন্স"
          value={formatBdt(MOCK_BALANCES.availableBalance)}
          accent="sky"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">উত্তোলন (Payout)</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-50">
            উত্তোলনযোগ্য ব্যালেন্স
          </h3>
          <p className="mt-4 text-4xl font-bold tracking-tight text-emerald-400">
            {formatBdt(MOCK_BALANCES.availableBalance)}
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            যাচাইকৃত আয় থেকে বর্তমানে উত্তোলনের জন্য প্রস্তুত অর্থের পরিমাণ।
          </p>

          <button
            type="button"
            disabled={!canWithdraw}
            className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${
              canWithdraw
                ? "bg-emerald-700 text-white hover:bg-emerald-600 focus-visible:outline-emerald-500"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500 focus-visible:outline-zinc-600"
            }`}
          >
            টাকা উত্তোলন করুন
          </button>

          <p className="mt-3 text-sm text-zinc-500">
            ন্যূনতম ৫০০ টাকা হলে উত্তোলন করা যাবে।
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-zinc-400">দ্রুত কাজ</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-50">
              নতুন প্রোডাক্ট খুঁজুন
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              মার্কেটপ্লেস থেকে হালাল ও অনুমোদিত প্রোডাক্ট বেছে নিয়ে আপনার
              অ্যাফিলিয়েট লিংক তৈরি করুন।
            </p>
          </div>

          <Link
            href="/promoter/marketplace"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-6 text-sm font-semibold text-zinc-50 transition-colors hover:border-emerald-700 hover:bg-emerald-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            প্রোডাক্ট খুঁজুন
          </Link>
        </div>
      </section>
    </div>
  );
}
