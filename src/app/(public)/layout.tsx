import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "@/lib/session";
import { redirect } from "next/navigation";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  
  let isLoggedIn = false;
  let userRole: "promoter" | "merchant" | "admin" | null = null;
  
  if (sessionCookie) {
    const session = await verifySession(sessionCookie.value);
    if (session) {
      isLoggedIn = true;
      userRole = session.role;
    }
  }

  return (
    <div className={`${notoSansBengali.className} flex min-h-screen flex-col bg-white dark:bg-zinc-950`}>
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            ইনশিরাহ
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600 sm:gap-6 dark:text-zinc-400">
              <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                হোম
              </Link>
              <Link href="/about" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                আমাদের সম্পর্কে
              </Link>
              <Link href="/shariah-policy" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
                শারীয়াহ নীতিমালা
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {isLoggedIn && userRole ? (
                <Link
                  href={`/${userRole}/dashboard`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 transition-colors hover:border-emerald-700 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
                >
                  ড্যাশবোর্ড
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 transition-colors hover:border-emerald-700 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
                  >
                    লগ-ইন
                  </Link>
                  <Link
                    href="/promoter/register"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    নিবন্ধন
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
