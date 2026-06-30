export default function MerchantDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-500">Merchant Panel</p>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Dashboard
        </h1>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
