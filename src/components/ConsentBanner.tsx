"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { buildLocalizedPath, Locale } from "@/lib/locale";

const CONSENT_STORAGE_KEY = "cookie-consent-v1";

type ConsentChoice = "accepted" | "rejected";

declare global {
  interface Window {
    __grantGoogleConsent?: () => void;
    __denyGoogleConsent?: () => void;
  }
}

const consentTranslations: Record<
  Locale,
  {
    title: string;
    description: string;
    accept: string;
    reject: string;
    privacy: string;
  }
> = {
  fr: {
    title: "Préférences de confidentialité",
    description:
      "Nous utilisons des cookies pour mesurer la performance et améliorer votre expérience. Vous pouvez accepter ou refuser le suivi publicitaire.",
    accept: "Accepter",
    reject: "Refuser",
    privacy: "Politique de confidentialité",
  },
  en: {
    title: "Privacy preferences",
    description:
      "We use cookies to measure performance and improve your experience. You can accept or refuse advertising tracking.",
    accept: "Accept",
    reject: "Decline",
    privacy: "Privacy policy",
  },
  ar: {
    title: "إعدادات الخصوصية",
    description:
      "نستخدم ملفات تعريف الارتباط لقياس الأداء وتحسين تجربتك. يمكنك قبول أو رفض تتبع الإعلانات.",
    accept: "قبول",
    reject: "رفض",
    privacy: "سياسة الخصوصية",
  },
};

export default function ConsentBanner() {
  const { locale } = useLanguage();
  const t = consentTranslations[locale];
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      setVisible(saved !== "accepted" && saved !== "rejected");
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const onChoose = (choice: ConsentChoice) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ignore storage failures and still apply runtime consent choice.
    }

    if (choice === "accepted") {
      window.__grantGoogleConsent?.();
    } else {
      window.__denyGoogleConsent?.();
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[80] px-4 md:bottom-6 md:px-6">
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
            <p className="text-sm font-semibold tracking-[0.01em] text-primary-100">
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
              className="rounded-lg border border-white/15 bg-transparent px-4 py-2 text-xs font-medium text-primary-200 transition-all duration-200 hover:border-white/30 hover:bg-white/5 hover:text-primary-100 md:text-sm"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={() => onChoose("accepted")}
              className="rounded-lg border border-gold-400/45 bg-gold-500/20 px-4 py-2 text-xs font-semibold text-gold-200 shadow-[0_0_0_1px_rgba(212,175,55,0.12)_inset] transition-all duration-200 hover:border-gold-300/70 hover:bg-gold-500/30 hover:text-gold-100 md:text-sm"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
