import assert from "node:assert/strict";
import vm from "node:vm";
import { getAnalyticsBootstrap } from "../src/lib/analytics-bootstrap";
import { sanitizeAnalyticsUrl } from "../src/lib/analytics-url";

function boot(saved?: string, storageBlocked = false) {
  const commands: unknown[][] = [];
  const scripts: Array<Record<string, unknown>> = [];
  const emitted: Array<{ type: string; detail: { choice: string } }> = [];
  const timers: Array<() => void> = [];
  const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
  const cookieWrites: string[] = [];
  const location = {
    hostname: "www.example.com",
    href: "https://www.example.com/livre?email=private%40example.com&utm_source=newsletter&utm_campaign=launch#personal",
  };
  const storage = new Map(saved ? [["cookie-consent-v1", saved]] : []);
  const window: Record<string, any> = {
    location,
    gtag: (...args: unknown[]) => commands.push(args),
    dispatchEvent: (event: (typeof emitted)[number]) => emitted.push(event),
    addEventListener: (name: string, listener: (event: Record<string, unknown>) => void) => { listeners[name] = listener; },
  };
  const document = {
    referrer: "https://referrer.example/from?email=private%40example.com#personal",
    createElement: () => ({}),
    head: { appendChild: (script: Record<string, unknown>) => scripts.push(script) },
    get cookie() { return "_ga=test; _ga_TEST=123; _gcl_au=test; session=keep"; },
    set cookie(value: string) { cookieWrites.push(value); },
  };
  vm.runInNewContext(getAnalyticsBootstrap("G-TEST123"), {
    window,
    document,
    location,
    localStorage: {
      getItem(key: string) { if (storageBlocked) throw new Error("blocked"); return storage.get(key) ?? null; },
      setItem(key: string, value: string) { if (storageBlocked) throw new Error("blocked"); storage.set(key, value); },
    },
    CustomEvent: class { constructor(public type: string, public options: { detail: unknown }) {} get detail() { return this.options.detail; } },
    setTimeout: (callback: () => void) => timers.push(callback),
    URL,
  });
  return { window, commands, scripts, emitted, cookieWrites, location, timers, listeners, storage };
}

const fresh = boot();
assert.equal(fresh.scripts.length, 0, "No Google request before a choice");
assert.equal(fresh.commands[0][0], "consent");
assert.equal(fresh.commands[0][1], "default");
assert.equal((fresh.commands[0][2] as Record<string, string>).analytics_storage, "denied");
assert.equal(fresh.commands.some((command) => command[0] === "config"), false);
fresh.window.__grantGoogleConsent();
assert.equal(fresh.scripts.length, 1);
assert.equal(fresh.window.__googleConsentChoice, "accepted");
assert.equal(fresh.window.__ga4Configured, true);
const safeContextIndex = fresh.commands.findIndex((command) => command[0] === "set" && typeof command[1] === "object" && "page_location" in (command[1] as object));
const safeContext = fresh.commands[safeContextIndex][1] as Record<string, string>;
assert.equal(safeContext.page_location, "https://www.example.com/livre?utm_source=newsletter&utm_campaign=launch");
assert.equal(safeContext.page_referrer, "https://referrer.example/from");
assert.ok(safeContextIndex < fresh.commands.findIndex((command) => command[0] === "config"), "Safe defaults must precede configuration and automatic events");
const gaConfig = fresh.commands.find((command) => command[0] === "config" && command[1] === "G-TEST123")!;
assert.equal((gaConfig[2] as Record<string, unknown>).send_page_view, false);
assert.equal((gaConfig[2] as Record<string, unknown>).allow_google_signals, false);
assert.equal(fresh.commands.some((command) => command[0] === "event" && command[1] === "page_view"), false);
fresh.window.__grantGoogleConsent();
assert.equal(fresh.scripts.length, 1, "Acceptance does not load a second tag");
assert.equal(fresh.commands.filter((command) => command[0] === "config" && command[1] === "G-TEST123").length, 1);
fresh.window.__denyGoogleConsent();
assert.equal(fresh.window["ga-disable-G-TEST123"], true);
assert.equal(fresh.storage.get("cookie-consent-v1"), "rejected");
assert.ok(fresh.cookieWrites.some((cookie) => cookie.startsWith("_ga=")));
assert.equal(fresh.cookieWrites.some((cookie) => cookie.startsWith("session=")), false);
const eventCount = fresh.commands.filter((command) => command[0] === "event").length;
fresh.window.gtag_report_email_conversion("mailto:contact@example.com");
assert.equal(fresh.location.href, "mailto:contact@example.com");
assert.equal(fresh.commands.filter((command) => command[0] === "event").length, eventCount, "Rejected conversions do not send events");

const blocked = boot(undefined, true);
blocked.window.__grantGoogleConsent();
assert.equal(blocked.window.__googleConsentChoice, "accepted");
assert.equal(blocked.emitted.at(-1)?.detail.choice, "accepted", "Storage failure cannot hide the runtime choice from a waiting redirect");
blocked.window.__denyGoogleConsent();
assert.equal(blocked.emitted.at(-1)?.detail.choice, "rejected");

assert.equal(boot("accepted").scripts.length, 1);
assert.equal(boot("rejected").scripts.length, 0);
const conversion = boot("accepted");
conversion.window.gtag_report_services_conversion("https://example.com/services");
const event = conversion.commands.find((command) => command[0] === "event")!;
assert.equal((event[2] as Record<string, unknown>).send_to, "AW-18259962578/qEV9COaX6MgcENLVg4NE");
conversion.timers.forEach((timer) => timer());
assert.equal(conversion.location.href, "https://example.com/services", "A blocked tag must not trap navigation");
conversion.listeners.storage({ key: "cookie-consent-v1", newValue: "rejected" });
assert.equal(conversion.window.__googleConsentChoice, "rejected", "Revocation propagates across tabs");
assert.equal(sanitizeAnalyticsUrl("https://example.com/livre?email=private%40example.com&utm_medium=email#private", true), "https://example.com/livre?utm_medium=email");
assert.equal(sanitizeAnalyticsUrl("https://name:secret@example.com/path?token=secret#fragment"), "https://example.com/path");
assert.equal(sanitizeAnalyticsUrl("not a URL", true), "");

console.log("Analytics checks passed: consent defaults, acceptance, rejection, storage failure, revocation, conversion fallback and sanitized URL context.");
