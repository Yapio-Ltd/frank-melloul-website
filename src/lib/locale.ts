export type Locale = "en" | "fr" | "ar";

export const LOCALES: Locale[] = ["en", "fr", "ar"];

export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  fr: "/fr",
  ar: "/ar",
};

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

export function getIntlLocale(locale: Locale): string {
  switch (locale) {
    case "fr":
      return "fr-FR";
    case "ar":
      return "ar";
    default:
      return "en-US";
  }
}

export function getOpenGraphLocale(locale: Locale): string {
  switch (locale) {
    case "fr":
      return "fr_FR";
    case "ar":
      return "ar_AE";
    default:
      return "en_US";
  }
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  return "en";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    return pathname.replace(/^\/fr/, "") || "/";
  }
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return pathname.replace(/^\/ar/, "") || "/";
  }
  return pathname;
}

export function buildLocalizedPath(pathWithoutPrefix: string, locale: Locale): string {
  const path = pathWithoutPrefix.startsWith("/")
    ? pathWithoutPrefix
    : `/${pathWithoutPrefix}`;
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return path === "/" ? "/" : path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function pickLocalizedText(
  row: Record<string, unknown>,
  field: string,
  locale: Locale
): string {
  if (locale === "en") {
    return String(row[`${field}_en`] ?? row[field] ?? "");
  }
  if (locale === "ar") {
    return String(row[`${field}_ar`] ?? row[`${field}_en`] ?? row[field] ?? "");
  }
  return String(row[field] ?? "");
}

/**
 * Returns the column name that holds the native content for a given locale.
 * The base column (no suffix) holds the French content.
 */
function localizedColumn(field: string, locale: Locale): string {
  if (locale === "en") return `${field}_en`;
  if (locale === "ar") return `${field}_ar`;
  return field;
}

/**
 * True when the row has its own (non-empty) content for the given locale,
 * without relying on a fallback to another language.
 */
export function hasLocalizedText(
  row: Record<string, unknown>,
  field: string,
  locale: Locale
): boolean {
  const value = row[localizedColumn(field, locale)];
  return typeof value === "string" && value.trim().length > 0;
}

export const LANGUAGE_ALTERNATES: Record<Locale, string> = {
  en: "/",
  fr: "/fr",
  ar: "/ar",
};
