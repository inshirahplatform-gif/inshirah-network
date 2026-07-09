import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"] });

export default function PromoterDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${notoSansBengali.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 transition-all hover:border-emerald-700 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40"
            >
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">হোম</span>
            </Link>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">প্রমোটার প্যানেল</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-950 dark:text-zinc-50">ড্যাশবোর্ড</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
              <Link href="/promoter/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white hover:shadow-sm dark:text-zinc-50 dark:hover:bg-zinc-700">
                ড্যাশবোর্ড
              </Link>
              <Link href="/promoter/marketplace" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-zinc-950 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50">
                মার্কেটপ্লেস
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
    </div>
  );
}
