import { CONSENT_STORAGE_KEY, GA4_MEASUREMENT_ID, type ConsentChoice } from "./analytics-config";

export type MailToClickLocation =
  | "header_desktop"
  | "header_mobile"
  | "contact_section"
  | "footer";

type TrackMailToClickOptions = {
  email: string;
  location: MailToClickLocation;
  linkText?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __gtagConfigured?: boolean;
    __ga4Configured?: boolean;
    __googleConsentChoice?: ConsentChoice;
    __grantGoogleConsent?: () => void;
    __denyGoogleConsent?: () => void;
    gtag_report_contact_form_conversion?: (url?: string) => boolean;
    gtag_report_email_conversion?: (url?: string) => boolean;
    gtag_report_services_conversion?: (url?: string) => boolean;
    gtag_report_biography_conversion?: (url?: string) => boolean;
    gtag_report_communication_conversion?: (url?: string) => boolean;
  }
}

const SITE_ORIGIN = "https://melloulandpartners.com";

export function toAbsoluteUrl(href: string): string {
  return new URL(href, SITE_ORIGIN).href;
}

function reportConversionAndNavigate(
  conversionFn: ((url?: string) => boolean) | undefined,
  url: string,
  event?: { preventDefault: () => void }
): void {
  event?.preventDefault();
  if (typeof conversionFn === "function") {
    conversionFn(url);
  } else {
    window.location.href = url;
  }
}

export function reportContactFormConversion(
  url: string,
  event?: { preventDefault: () => void }
): void {
  reportConversionAndNavigate(
    window.gtag_report_contact_form_conversion,
    url,
    event
  );
}

export function reportEmailConversion(
  url: string,
  event?: { preventDefault: () => void }
): void {
  reportConversionAndNavigate(window.gtag_report_email_conversion, url, event);
}

export function reportServicesConversion(
  url: string,
  event?: { preventDefault: () => void }
): void {
  reportConversionAndNavigate(
    window.gtag_report_services_conversion,
    url,
    event
  );
}

export function reportBiographyConversion(
  url: string,
  event?: { preventDefault: () => void }
): void {
  reportConversionAndNavigate(
    window.gtag_report_biography_conversion,
    url,
    event
  );
}

export function reportCommunicationConversion(
  url: string,
  event?: { preventDefault: () => void }
): void {
  reportConversionAndNavigate(
    window.gtag_report_communication_conversion,
    url,
    event
  );
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  if (window.__googleConsentChoice) return window.__googleConsentChoice === "accepted";

  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function trackMailToClick({
  email,
  location,
  linkText,
}: TrackMailToClickOptions): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  if (!GA4_MEASUREMENT_ID || typeof window.gtag !== "function") return;

  window.gtag("event", "mailTo", {
    send_to: GA4_MEASUREMENT_ID,
    event_category: "contact",
    event_label: email,
    link_url: `mailto:${email}`,
    link_text: linkText ?? email,
    click_location: location,
    transport_type: "beacon",
  });
}
