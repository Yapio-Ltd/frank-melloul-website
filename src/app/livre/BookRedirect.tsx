"use client";

import { useEffect, useRef, useState } from "react";
import { BOOK_COUNTER_ENABLED, CONSENT_STORAGE_KEY, GA4_MEASUREMENT_ID, type ConsentChoice } from "@/lib/analytics-config";
import { BOOK_RETAILERS, bookRedirectUrl, startBookRedirect, type BookRetailer } from "@/lib/book-links";

function readConsent(): ConsentChoice | undefined {
  if (window.__googleConsentChoice) return window.__googleConsentChoice;
  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    return saved === "accepted" || saved === "rejected" ? saved : undefined;
  } catch {
    return undefined;
  }
}

export default function BookRedirect({ retailer }: { retailer: BookRetailer }) {
  const destination = BOOK_RETAILERS[retailer];
  const started = useRef(false);
  const cancelAutomaticRedirect = useRef<(() => void) | undefined>();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let initialTimer: ReturnType<typeof setTimeout>;
    let cancelRedirect: (() => void) | undefined;

    const continueToRetailer = (choice: ConsentChoice | undefined) => {
      // With the counter enabled, cookie preferences never block the departure.
      if ((!BOOK_COUNTER_ENABLED && !choice) || started.current) return;
      started.current = true;
      setRedirecting(true);
      cancelRedirect = startBookRedirect({
        retailer,
        measurementId: GA4_MEASUREMENT_ID,
        consentChoice: choice,
        counterEnabled: BOOK_COUNTER_ENABLED,
        gtag: window.gtag,
        navigate: (url) => window.location.replace(url),
      });
    };

    const onConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<{ choice?: ConsentChoice }>).detail?.choice;
      if (choice !== "accepted" && choice !== "rejected") return;
      clearTimeout(initialTimer);
      // Let the shared page-view listener run before the departure event.
      initialTimer = setTimeout(() => continueToRetailer(choice), 0);
    };

    window.addEventListener("google-consent-change", onConsentChange);
    // StrictMode replays effects before this runs; cleanup prevents two events.
    initialTimer = setTimeout(() => continueToRetailer(readConsent()), 0);

    const cancelPending = () => {
      clearTimeout(initialTimer);
      cancelRedirect?.();
    };
    cancelAutomaticRedirect.current = cancelPending;

    return () => {
      cancelPending();
      cancelAutomaticRedirect.current = undefined;
      window.removeEventListener("google-consent-change", onConsentChange);
    };
  }, [retailer]);

  return (
    <>
      <p aria-live="polite" className="mt-6 text-base leading-relaxed text-primary-200">
        {redirecting || BOOK_COUNTER_ENABLED
          ? `Redirection vers ${destination.name}…`
          : `Votre livre vous attend sur ${destination.name}.`}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-primary-300">
        {redirecting || BOOK_COUNTER_ENABLED
          ? "Si la page ne s’ouvre pas, utilisez le lien ci-dessous."
          : "Choisissez vos préférences de confidentialité pour continuer automatiquement, ou accédez directement au livre ci-dessous."}
      </p>
      <a
        href={bookRedirectUrl(retailer, BOOK_COUNTER_ENABLED)}
        onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          // Native navigation owns this departure; a late GA callback must not
          // request /go again while its first response is still in flight.
          started.current = true;
          cancelAutomaticRedirect.current?.();
        }}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg border border-gold-400/40 bg-gold-500/15 px-6 py-3 font-medium text-gold-200 transition-colors hover:bg-gold-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
      >
        Continuer vers {destination.name}
      </a>
      <noscript>
        <p className="mt-4 text-sm text-primary-300">Le lien ci-dessus fonctionne aussi sans JavaScript.</p>
      </noscript>
    </>
  );
}
