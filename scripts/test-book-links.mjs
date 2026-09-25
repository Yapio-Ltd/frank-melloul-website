import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BOOK_REDIRECT_TIMEOUT_MS,
  BOOK_RETAILERS,
  bookLinkPath,
  startBookRedirect,
} from "../src/lib/book-links.ts";

test("choice links preserve campaign attribution but reject unrelated redirect parameters", () => {
  const path = bookLinkPath("fnac", {
    utm_source: "newsletter",
    utm_medium: ["email", "ignored"],
    utm_campaign: "La bascule — lancement",
    utm_content: "x".repeat(300),
    redirect: "https://untrusted.example",
    email: "reader@example.com",
  });
  const url = new URL(path, "https://melloulandpartners.com");
  assert.equal(url.pathname, "/livre/fnac");
  assert.equal(url.searchParams.get("utm_source"), "newsletter");
  assert.equal(url.searchParams.get("utm_medium"), "email");
  assert.equal(url.searchParams.get("utm_campaign"), "La bascule — lancement");
  assert.equal(url.searchParams.get("utm_content").length, 200);
  assert.equal(url.searchParams.has("redirect"), false);
  assert.equal(url.searchParams.has("email"), false);
  assert.equal(bookLinkPath(), "/livre");
  assert.equal(bookLinkPath("amazon"), "/livre/amazon");
});

for (const retailer of Object.keys(BOOK_RETAILERS)) {
  test(`${retailer}: no analytics event without consent`, () => {
    let calls = 0;
    const navigations = [];
    startBookRedirect({
      retailer,
      analyticsConsent: false,
      measurementId: "G-TEST1234",
      gtag: () => calls++,
      navigate: (url) => navigations.push(url),
    });
    assert.equal(calls, 0);
    assert.deepEqual(navigations, [BOOK_RETAILERS[retailer].url]);
  });

  test(`${retailer}: opted-in event targets GA4 and callback navigates only once`, (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let event;
    const navigations = [];
    startBookRedirect({
      retailer,
      analyticsConsent: true,
      measurementId: "G-TEST1234",
      gtag: (...args) => { event = args; },
      navigate: (url) => navigations.push(url),
    });
    assert.deepEqual(event.slice(0, 2), ["event", "book_outbound_click"]);
    assert.equal(event[2].send_to, "G-TEST1234");
    assert.equal(event[2].book_id, "la_bascule");
    assert.equal(event[2].retailer, retailer);
    assert.equal(event[2].link_url, BOOK_RETAILERS[retailer].url);
    assert.equal(event[2].transport_type, "beacon");
    assert.deepEqual(navigations, []);
    event[2].event_callback();
    event[2].event_callback();
    t.mock.timers.tick(BOOK_REDIRECT_TIMEOUT_MS);
    assert.deepEqual(navigations, [BOOK_RETAILERS[retailer].url]);
  });
}

test("a blocked tag cannot prevent retailer navigation", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const navigations = [];
  startBookRedirect({
    retailer: "fnac",
    analyticsConsent: true,
    measurementId: "G-TEST1234",
    gtag: () => {},
    navigate: (url) => navigations.push(url),
  });
  t.mock.timers.tick(BOOK_REDIRECT_TIMEOUT_MS - 1);
  assert.deepEqual(navigations, []);
  t.mock.timers.tick(1);
  assert.deepEqual(navigations, [BOOK_RETAILERS.fnac.url]);
});

test("cleanup cancels navigation from both callbacks and timers", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let callback;
  let navigations = 0;
  const cancel = startBookRedirect({
    retailer: "fnac",
    analyticsConsent: true,
    measurementId: "G-TEST1234",
    gtag: (_command, _name, parameters) => { callback = parameters.event_callback; },
    navigate: () => navigations++,
  });
  cancel();
  callback();
  t.mock.timers.tick(BOOK_REDIRECT_TIMEOUT_MS);
  assert.equal(navigations, 0);
});

test("tag failures and missing configuration still navigate immediately", () => {
  for (const options of [
    { measurementId: undefined, gtag: () => assert.fail("must not send without ID") },
    { measurementId: "G-TEST1234", gtag: undefined },
    { measurementId: "G-TEST1234", gtag: () => { throw new Error("blocked tag"); } },
  ]) {
    const navigations = [];
    startBookRedirect({
      retailer: "amazon",
      analyticsConsent: true,
      ...options,
      navigate: (url) => navigations.push(url),
    });
    assert.deepEqual(navigations, [BOOK_RETAILERS.amazon.url]);
  }
});
