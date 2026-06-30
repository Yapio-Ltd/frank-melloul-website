const CONSENT_STORAGE_KEY = "cookie-consent-v1";

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
  }
}

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

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
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "mailTo", {
    event_category: "contact",
    event_label: email,
    link_url: `mailto:${email}`,
    link_text: linkText ?? email,
    click_location: location,
    transport_type: "beacon",
  });
}
