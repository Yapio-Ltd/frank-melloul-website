import { CONSENT_STORAGE_KEY, GA4_MEASUREMENT_ID, GOOGLE_ADS_ID } from "./analytics-config";
import { sanitizeAnalyticsUrl } from "./analytics-url";

/** Kept inline so default consent is established before any Google script loads. */
export function getAnalyticsBootstrap(measurementId = GA4_MEASUREMENT_ID): string {
  return `
    (function () {
      var analyticsId = ${JSON.stringify(measurementId ?? null)};
      var adsId = ${JSON.stringify(GOOGLE_ADS_ID)};
      var consentKey = ${JSON.stringify(CONSENT_STORAGE_KEY)};
      var started = false;
      var sanitizeUrl = ${sanitizeAnalyticsUrl.toString()};
      var denied = {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      };
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', denied);
      window.gtag('set', 'ads_data_redaction', true);
      window.gtag('set', 'url_passthrough', false);

      function setSafePageContext() {
        window.gtag('set', {
          page_location: sanitizeUrl(location.href, true),
          page_referrer: sanitizeUrl(document.referrer)
        });
      }

      function startTags() {
        if (started) return;
        started = true;
        // Applies to automatic and custom events, including the initial session.
        setSafePageContext();
        window.gtag('js', new Date());
        window.gtag('config', adsId, { allow_ad_personalization_signals: false });
        if (analyticsId) {
          window.gtag('config', analyticsId, {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
          window.__ga4Configured = true;
        }
        var script = document.createElement('script');
        script.async = true;
        script.id = 'google-measurement-script';
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + (analyticsId || adsId);
        document.head.appendChild(script);
      }

      function clearMeasurementCookies() {
        var domains = [location.hostname];
        var parts = location.hostname.split('.');
        while (parts.length > 1) {
          domains.push('.' + parts.join('.'));
          parts.shift();
        }
        document.cookie.split(';').forEach(function (entry) {
          var name = entry.split('=')[0].trim();
          if (!/^(_ga($|_)|_gid$|_gat($|_)|_gcl_)/.test(name)) return;
          var expired = name + '=; Max-Age=0; path=/; SameSite=Lax';
          document.cookie = expired;
          domains.forEach(function (domain) {
            document.cookie = expired + '; domain=' + domain;
          });
        });
      }

      function applyConsent(choice, persist) {
        if (persist) {
          try { localStorage.setItem(consentKey, choice); } catch (e) {}
        }
        window.__googleConsentChoice = choice;
        if (analyticsId) window['ga-disable-' + analyticsId] = choice !== 'accepted';
        window.gtag('consent', 'update', choice === 'accepted' ? {
          analytics_storage: 'granted', ad_storage: 'granted',
          ad_user_data: 'denied', ad_personalization: 'denied'
        } : denied);
        if (choice === 'accepted') startTags();
        else clearMeasurementCookies();
        window.dispatchEvent(new CustomEvent('google-consent-change', { detail: { choice: choice } }));
      }
      window.__grantGoogleConsent = function () { applyConsent('accepted', true); };
      window.__denyGoogleConsent = function () { applyConsent('rejected', true); };

      function conversion(label, url) {
        var navigated = false;
        function done() {
          if (!navigated && typeof url === 'string') {
            navigated = true;
            window.location.href = url;
          }
        }
        if (window.__googleConsentChoice !== 'accepted') { done(); return false; }
        window.gtag('event', 'conversion', {
          send_to: adsId + '/' + label, value: 1.0, currency: 'AED',
          event_callback: done, event_timeout: 1000
        });
        if (typeof url === 'string') setTimeout(done, 1100);
        return false;
      }
      window.gtag_report_contact_form_conversion = function (url) { return conversion('6YVFCOqB48gcENLVg4NE', url); };
      window.gtag_report_email_conversion = function (url) { return conversion('L1kyCJC258gcENLVg4NE', url); };
      window.gtag_report_services_conversion = function (url) { return conversion('qEV9COaX6MgcENLVg4NE', url); };
      window.gtag_report_biography_conversion = function (url) { return conversion('8YsdCPva6MgcENLVg4NE', url); };
      window.gtag_report_communication_conversion = function (url) { return conversion('3xT4CLbX6MgcENLVg4NE', url); };

      try {
        var saved = localStorage.getItem(consentKey);
        if (saved === 'accepted' || saved === 'rejected') applyConsent(saved, false);
      } catch (e) {}
      window.addEventListener('storage', function (event) {
        if (event.key !== consentKey && event.key !== null) return;
        applyConsent(event.newValue === 'accepted' ? 'accepted' : 'rejected', false);
      });
    })();
  `;
}
