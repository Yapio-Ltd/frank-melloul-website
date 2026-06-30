"use client";

import { useEffect } from "react";
import { trackMailToClick, type MailToClickLocation } from "@/lib/gtag";

const MAILTO_SELECTOR = 'a[href^="mailto:"]';

function resolveLocation(anchor: HTMLAnchorElement): MailToClickLocation {
  const explicit = anchor.dataset.mailtoLocation as
    | MailToClickLocation
    | undefined;
  if (explicit) return explicit;

  if (anchor.closest("header")) {
    return anchor.closest('[class*="fixed inset-0"]')
      ? "header_mobile"
      : "header_desktop";
  }
  if (anchor.closest("#contact")) return "contact_section";
  if (anchor.closest("footer")) return "footer";

  return "footer";
}

function extractEmail(href: string): string {
  return href.replace(/^mailto:/i, "").split("?")[0];
}

export default function GtagMailToTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest(MAILTO_SELECTOR);
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const email = extractEmail(anchor.href);
      if (!email) return;

      trackMailToClick({
        email,
        location: resolveLocation(anchor),
        linkText: anchor.textContent?.trim() || email,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
