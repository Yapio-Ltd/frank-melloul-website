import type { ConsentChoice } from "./analytics-config";

export const BOOK_ID = "la_bascule";
export const BOOK_REDIRECT_TIMEOUT_MS = 1500;

export const BOOK_RETAILERS = {
  fnac: {
    name: "la Fnac",
    label: "Fnac",
    url: "https://www.fnac.com/a23239513/Frank-Melloul-La-bascule",
  },
  amazon: {
    name: "Amazon",
    label: "Amazon",
    url: "https://www.amazon.fr/bascule-coulisses-nouveau-Moyen-Orient/dp/B0H622KXCW",
  },
} as const;

export type BookRetailer = keyof typeof BOOK_RETAILERS;
export type BookSearchParams = Record<string, string | string[] | undefined>;

export function bookRedirectUrl(retailer: BookRetailer, counterEnabled = false): string {
  return counterEnabled ? `/go/${retailer}` : BOOK_RETAILERS[retailer].url;
}

const CAMPAIGN_PARAMETERS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

export function bookLinkPath(
  retailer?: BookRetailer,
  searchParams: BookSearchParams = {}
): string {
  const campaign = new URLSearchParams();
  for (const key of CAMPAIGN_PARAMETERS) {
    const value = searchParams[key];
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) campaign.set(key, firstValue.slice(0, 200));
  }

  const path = retailer ? `/livre/${retailer}` : "/livre";
  const query = campaign.toString();
  return query ? `${path}?${query}` : path;
}

type BookRedirectOptions = {
  retailer: BookRetailer;
  measurementId?: string;
  consentChoice?: ConsentChoice;
  counterEnabled?: boolean;
  gtag?: (...args: unknown[]) => void;
  navigate: (url: string) => void;
};

/** Records an opted-in departure, then navigates even if the tag is blocked. */
export function startBookRedirect({
  retailer,
  measurementId,
  consentChoice,
  counterEnabled = false,
  gtag,
  navigate,
}: BookRedirectOptions): () => void {
  // Keep the existing consent interstitial until the server counter is enabled.
  if (!counterEnabled && !consentChoice) return () => {};

  const destination = BOOK_RETAILERS[retailer];
  let finished = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    finished = true;
    if (timeout !== undefined) clearTimeout(timeout);
  };

  const finish = () => {
    if (finished) return;
    cancel();
    navigate(bookRedirectUrl(retailer, counterEnabled));
  };

  if (consentChoice !== "accepted" || !measurementId || typeof gtag !== "function") {
    finish();
    return cancel;
  }

  // This timer is independent of Google: ad blockers may prevent callbacks.
  timeout = setTimeout(finish, BOOK_REDIRECT_TIMEOUT_MS);
  try {
    gtag("event", "book_outbound_click", {
      send_to: measurementId,
      book_id: BOOK_ID,
      retailer,
      link_url: destination.url,
      link_domain: new URL(destination.url).hostname,
      outbound: true,
      transport_type: "beacon",
      event_callback: finish,
      event_timeout: 1200,
    });
  } catch {
    finish();
  }

  return cancel;
}
