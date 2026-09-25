"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations } from "@/lib/translations";
import { Locale, isValidLocale, isRtl } from "@/lib/locale";
import { usePathname } from "next/navigation";
import { isBookPath } from "@/lib/analytics-config";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations[Locale];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "en");
  const pathname = usePathname();
  const effectiveLocale = isBookPath(pathname) ? "fr" : locale;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved && isValidLocale(saved)) setLocaleState(saved);
    } catch {
      // Keep the route language when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
    document.documentElement.dir = isRtl(effectiveLocale) ? "rtl" : "ltr";
  }, [effectiveLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("locale", newLocale);
    } catch {
      // The selected language still applies to the current page.
    }
  };

  const t = translations[effectiveLocale];

  return (
    <LanguageContext.Provider value={{ locale: effectiveLocale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
