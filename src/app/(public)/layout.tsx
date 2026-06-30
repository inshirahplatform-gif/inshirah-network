import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${notoSansBengali.className} flex min-h-full flex-col`}>
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            Inshirah
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600 sm:gap-6 dark:text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">
              হোম
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              আমাদের সম্পর্কে
            </Link>
            <Link
              href="/shariah-policy"
              className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              শারীয়াহ নীতিমালা
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
