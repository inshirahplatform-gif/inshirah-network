"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");

    if (ref) {
      // Set cookie with 30-day expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      document.cookie = `inshirah_ref=${encodeURIComponent(ref)}; expires=${expires.toUTCString()}; path=/; sameSite=lax`;
    }
  }, [searchParams]);

  return null;
}
