"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { buildLocalizedPath, Locale } from "@/lib/locale";
import { CONSENT_STORAGE_KEY, isBookRetailerPath, type ConsentChoice } from "@/lib/analytics-config";
import "@/lib/gtag";

const consentTranslations: Record<
  Locale,
  {
    title: string;
    description: string;
    accept: string;
    reject: string;
    privacy: string;
    preferences: string;
  }
> = {
  fr: {
    title: "Préférences de confidentialité",
    description:
      "Avec votre accord, Google Analytics mesure les visites et les clics, et Google Ads mesure les conversions publicitaires. Vous pouvez refuser ces cookies et modifier votre choix à tout moment via « Cookies ».",
    accept: "Accepter",
    reject: "Refuser",
    privacy: "Politique de confidentialité",
    preferences: "Cookies",
  },
  en: {
    title: "Privacy preferences",
    description:
      "With your permission, Google Analytics measures visits and clicks, and Google Ads measures advertising conversions. You can decline these cookies and change your choice at any time via “Cookies”.",
    accept: "Accept",
    reject: "Decline",
    privacy: "Privacy policy",
    preferences: "Cookies",
  },
  ar: {
    title: "إعدادات الخصوصية",
    description:
      "بموافقتك، يقيس Google Analytics الزيارات والنقرات، ويقيس Google Ads التحويلات الإعلانية. يمكنك رفض ملفات تعريف الارتباط وتغيير اختيارك في أي وقت عبر إعدادات ملفات الارتباط.",
    accept: "قبول",
    reject: "رفض",
    privacy: "سياسة الخصوصية",
    preferences: "ملفات الارتباط",
  },
};

export default function ConsentBanner() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = consentTranslations[locale];
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    function refresh() {
      let choice = window.__googleConsentChoice;
      if (!choice) {
        try {
          const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
          if (saved === "accepted" || saved === "rejected") choice = saved;
        } catch {
          // Runtime consent still works when localStorage is disabled.
        }
      }
      setVisible(!choice);
      setInitialized(true);
    }
    refresh();
    window.addEventListener("google-consent-change", refresh);
    return () => window.removeEventListener("google-consent-change", refresh);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const onChoose = (choice: ConsentChoice) => {
    const apply = choice === "accepted" ? window.__grantGoogleConsent : window.__denyGoogleConsent;
    if (apply) {
      apply();
    } else {
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, choice);
      } catch {
        // The in-memory choice applies even when persistence is unavailable.
      }
      window.__googleConsentChoice = choice;
      window.dispatchEvent(new CustomEvent("google-consent-change", { detail: { choice } }));
    }

    setVisible(false);
  };

  if (!initialized || isBookRetailerPath(pathname)) return null;
  if (!visible) {
    return (
      <button
        type="button"
        aria-label={t.title}
        aria-controls="cookie-preferences"
        onClick={() => { setMounted(false); setVisible(true); }}
        className="fixed bottom-3 left-3 z-[80] rounded-md border border-white/20 bg-navy-950/95 px-3 py-1.5 text-xs text-primary-200 shadow-sm transition-colors hover:border-gold-400/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
      >
        {t.preferences}
      </button>
    );
  }

  return (
    <section
      id="cookie-preferences"
      aria-labelledby="cookie-preferences-title"
      lang={locale}
      className="fixed inset-x-0 bottom-4 z-[80] px-4 md:bottom-6 md:px-6"
    >
      <div
        className={[
          "relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border",
          "border-gold-500/20 bg-navy-950/80 p-4 shadow-[0_24px_80px_rgba(3,8,20,0.65)] backdrop-blur-xl",
          "transition-all duration-500 md:p-5",
          mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_35%)]" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="max-w-2xl">
            <p id="cookie-preferences-title" className="text-sm font-semibold tracking-[0.01em] text-primary-100">
              {t.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-primary-300 md:text-sm">
              {t.description}{" "}
              <Link
                href={buildLocalizedPath("/privacy", locale)}
                className="font-medium text-gold-300 underline decoration-gold-400/60 underline-offset-2 transition-colors hover:text-gold-200"
              >
                {t.privacy}
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 md:shrink-0">
            <button
              type="button"
              onClick={() => onChoose("rejected")}
              className="rounded-lg border border-gold-400/45 bg-gold-500/10 px-4 py-2 text-xs font-medium text-gold-200 transition-colors hover:border-gold-300/70 hover:bg-gold-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 md:text-sm"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={() => onChoose("accepted")}
              className="rounded-lg border border-gold-400/45 bg-gold-500/10 px-4 py-2 text-xs font-medium text-gold-200 transition-colors hover:border-gold-300/70 hover:bg-gold-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 md:text-sm"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
