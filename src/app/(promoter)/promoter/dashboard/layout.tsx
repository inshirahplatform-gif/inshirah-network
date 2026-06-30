export default function PromoterDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <p className="text-sm font-medium text-zinc-500">প্রমোটার প্যানেল</p>
        <h1 className="text-lg font-semibold text-zinc-50">ড্যাশবোর্ড</h1>
      </header>
      <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
