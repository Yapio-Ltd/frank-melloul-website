"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics-config";
import { hasAnalyticsConsent } from "@/lib/gtag";
import { sanitizeAnalyticsUrl } from "@/lib/analytics-url";

export default function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPage = useRef<string>();
  const previousPage = useRef<string>();

  useEffect(() => {
    function trackPage() {
      if (!hasAnalyticsConsent()) {
        lastPage.current = undefined;
        return;
      }
      if (!GA4_MEASUREMENT_ID || !window.__ga4Configured || !window.gtag) return;
      if (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")) return;

      // Retain campaign attribution without leaking arbitrary query values.
      const page = sanitizeAnalyticsUrl(window.location.href, true);
      if (lastPage.current === page) return;
      const referrer = sanitizeAnalyticsUrl(previousPage.current ?? document.referrer);
      window.gtag("set", { page_location: page, page_referrer: referrer });
      window.gtag("event", "page_view", {
        send_to: GA4_MEASUREMENT_ID,
        page_location: page,
        page_title: document.title,
        page_referrer: referrer,
      });
      lastPage.current = page;
      previousPage.current = page;
    }

    trackPage();
    window.addEventListener("google-consent-change", trackPage);
    return () => window.removeEventListener("google-consent-change", trackPage);
  }, [pathname, searchParams]);

  return null;
}
