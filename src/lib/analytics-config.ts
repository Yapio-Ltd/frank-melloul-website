export const GOOGLE_ADS_ID = "AW-18259962578";
export const BOOK_COUNTER_ENABLED = process.env.NEXT_PUBLIC_BOOK_COUNTER_ENABLED === "true";

// Public measurement identifier, never a Measurement Protocol secret.
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
export const GA4_MEASUREMENT_ID =
  measurementId && /^G-[A-Z0-9]+$/.test(measurementId)
    ? measurementId
    : undefined;

export const CONSENT_STORAGE_KEY = "cookie-consent-v1";
export type ConsentChoice = "accepted" | "rejected";

export function isBookPath(pathname: string): boolean {
  return pathname === "/livre" || pathname.startsWith("/livre/");
}

export function isBookRetailerPath(pathname: string): boolean {
  return pathname === "/livre/fnac" || pathname === "/livre/amazon";
}
