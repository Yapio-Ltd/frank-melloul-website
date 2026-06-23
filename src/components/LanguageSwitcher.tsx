"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Locale,
  buildLocalizedPath,
  stripLocalePrefix,
} from "@/lib/locale";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const languages: { code: Locale; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "ar", label: "AR" },
  ];

  const navigateToLocale = (targetLocale: Locale) => {
    const pathWithoutLocale = stripLocalePrefix(pathname);
    const nextPath = buildLocalizedPath(pathWithoutLocale, targetLocale);
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.push(`${nextPath}${hash}`);
  };

  return (
    <div className="flex items-center gap-1 bg-navy-900/50 rounded-full p-1">
      {languages.map((lang) => {
        const isActive = locale === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => {
              setLocale(lang.code);
              navigateToLocale(lang.code);
            }}
            className={`relative px-3 py-1.5 text-xs font-medium tracking-wider rounded-full transition-all duration-300 ${
              isActive
                ? "text-navy-950 bg-gold-400"
                : "text-primary-400 hover:text-primary-200 bg-transparent"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
