import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${notoSansBengali.className} min-h-full bg-zinc-950`}>
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Admin badge */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950/50 text-sm text-amber-400">
              ⚙
            </span>
            <div>
              <p className="text-xs font-medium text-zinc-500">সুপার অ্যাডমিন</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-50">
                ইনশিরাহ নেটওয়ার্ক
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
            >
              ড্যাশবোর্ড
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
