"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      console.log("BANDHA: Referral code detected and persisting:", ref);
      
      // Persist in localStorage
      localStorage.setItem("bandha_ref", ref);
      
      // Persist in Cookie (30 days)
      const expires = new Date();
      expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `bandha_referral_code=${ref};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  }, [ref]);

  return null;
}
