import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ReferralTracker } from "@/components/providers/ReferralTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ইনশিরাহ",
    template: "%s | ইনশিরাহ",
  },
  description:
    "ইনশিরাহ — বাংলাদেশের প্রথম শারীয়াহ-সম্মত দ্বীনি অ্যাফিলিয়েট নেটওয়ার্ক।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ReferralTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
