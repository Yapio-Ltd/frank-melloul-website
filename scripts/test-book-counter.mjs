import assert from "node:assert/strict";
import { test } from "node:test";
import { countBookRedirect, BOOK_COUNTER_TIMEOUT_MS } from "../src/lib/book-counter.ts";
import { createBookCounterRedirectHandlers } from "../src/lib/book-counter-redirect.ts";
import { BOOK_RETAILERS } from "../src/lib/book-links.ts";

function configureCounter(t, enabled = true) {
  const settings = {
    BOOK_COUNTER_ENABLED: enabled ? "true" : "false",
    NEXT_PUBLIC_SUPABASE_URL: "https://counter-test.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "public-test-key-not-a-real-credential",
    BOOK_COUNTER_TOKEN: "server-counter-test-token-not-a-real-credential",
  };
  const previous = Object.fromEntries(Object.keys(settings).map((key) => [key, process.env[key]]));
  Object.assign(process.env, settings);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

const unreadableRequest = new Proxy({}, {
  get() { assert.fail("The aggregate redirect must not read any request data"); },
});

test("GET counts exactly one fixed retailer and redirects without exposing request data", async () => {
  const calls = [];
  const { GET } = createBookCounterRedirectHandlers(async (...args) => { calls.push(args); return "recorded"; });
  for (const retailer of ["fnac", "amazon"]) {
    const response = await GET(unreadableRequest, { params: { retailer } });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), BOOK_RETAILERS[retailer].url);
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.has("set-cookie"), false);
  }
  assert.deepEqual(calls, [["fnac"], ["amazon"]]);
});

test("unknown, prototype and injected retailer names cannot count or choose destinations", async () => {
  let calls = 0;
  const handlers = createBookCounterRedirectHandlers(async () => { calls++; return "recorded"; });
  for (const retailer of ["__proto__", "constructor", "https://evil.example", "fnac?redirect=https://evil.example", "fnac/../amazon", "FNAC", ""]) {
    for (const handler of [handlers.GET, handlers.HEAD]) {
      const response = await handler(unreadableRequest, { params: { retailer } });
      assert.equal(response.status, 404);
      assert.equal(response.headers.has("location"), false);
    }
  }
  assert.equal(calls, 0);
});

test("HEAD never increments the counter", async () => {
  const { HEAD } = createBookCounterRedirectHandlers(async () => assert.fail("HEAD must not count"));
  const response = await HEAD(unreadableRequest, { params: { retailer: "amazon" } });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), BOOK_RETAILERS.amazon.url);
  assert.equal(await response.text(), "");
});

test("disabled storage, failed storage and thrown errors all preserve the fixed redirect", async () => {
  for (const counter of [async () => "disabled", async () => "unavailable", async () => { throw new Error("database unavailable"); }]) {
    const response = await createBookCounterRedirectHandlers(counter).GET(unreadableRequest, { params: { retailer: "fnac" } });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), BOOK_RETAILERS.fnac.url);
    assert.equal(await response.text(), "");
  }
});

test("counter is opt-in and requires a server secret", async (t) => {
  configureCounter(t, false);
  const warnings = [];
  t.mock.method(process.stderr, "write", (message) => { warnings.push(message); return true; });
  t.mock.method(globalThis, "fetch", () => assert.fail("Disabled counter must not contact Supabase"));
  assert.equal(await countBookRedirect("fnac"), "disabled");
  assert.deepEqual(warnings, []);
  process.env.BOOK_COUNTER_ENABLED = "true";
  delete process.env.BOOK_COUNTER_TOKEN;
  assert.equal(await countBookRedirect("fnac"), "disabled");
  assert.equal(await countBookRedirect("amazon"), "disabled");
  assert.deepEqual(warnings, ["[book-counter] enabled but misconfigured\n"], "Misconfiguration logs only a static, rate-limited status");
});

test("counter validates retailer at runtime before any database call", async (t) => {
  configureCounter(t);
  t.mock.method(globalThis, "fetch", () => assert.fail("Invalid retailer must not reach Supabase"));
  assert.equal(await countBookRedirect("__proto__"), "unavailable");
});

test("a successful count makes one POST with only the retailer and narrowly scoped token", async (t) => {
  configureCounter(t);
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return new Response(null, { status: 204 });
  });
  assert.equal(await countBookRedirect("fnac"), "recorded");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://counter-test.supabase.co/rest/v1/rpc/increment_book_redirect_count");
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    p_retailer: "fnac", p_token: "server-counter-test-token-not-a-real-credential",
  });
  const headers = new Headers(calls[0].options.headers);
  assert.equal(headers.get("authorization"), "Bearer public-test-key-not-a-real-credential");
  assert.equal(headers.has("cookie"), false);
  assert.equal(headers.has("x-forwarded-for"), false);
  assert.equal(headers.has("referer"), false);
});

test("database errors do not retry or report a recorded count", async (t) => {
  configureCounter(t);
  const warnings = [];
  t.mock.method(process.stderr, "write", (message) => { warnings.push(message); return true; });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return Response.json({ message: "unavailable" }, { status: 503 });
  });
  assert.equal(await countBookRedirect("amazon"), "unavailable");
  assert.equal(calls, 1);
  assert.equal(await countBookRedirect("fnac"), "unavailable");
  assert.equal(calls, 2, "Exactly one attempt per navigation");
  assert.deepEqual(warnings, ["[book-counter] unavailable\n"], "Storage failures log only a static, rate-limited status");
});

test("network failure does not retry an uncertain write", async (t) => {
  configureCounter(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; throw new Error("connection lost"); });
  assert.equal(await countBookRedirect("amazon"), "unavailable");
  assert.equal(calls, 1);
});

test("800 ms deadline aborts a stalled count and never retries a late result", async (t) => {
  configureCounter(t);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  let signal;
  let finishFetch;
  t.mock.method(globalThis, "fetch", (_url, options) => {
    calls++;
    signal = options.signal;
    return new Promise((resolve) => { finishFetch = resolve; });
  });
  const result = countBookRedirect("fnac");
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  assert.equal(signal.aborted, false);
  t.mock.timers.tick(BOOK_COUNTER_TIMEOUT_MS);
  assert.equal(await result, "unavailable");
  assert.equal(signal.aborted, true);
  finishFetch(new Response(null, { status: 204 }));
  await new Promise(setImmediate);
  assert.equal(calls, 1);
});
