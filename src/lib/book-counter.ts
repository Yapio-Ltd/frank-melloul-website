import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { BookRetailer } from "./book-links";

export const BOOK_COUNTER_TIMEOUT_MS = 800;
export type BookCounterResult = "recorded" | "disabled" | "unavailable";
type CounterWarning = "misconfigured" | "unavailable";
const WARNING_INTERVAL_MS = 60_000;
const lastWarningAt: Partial<Record<CounterWarning, number>> = {};

function warnCounterIssue(reason: CounterWarning): void {
  const now = Date.now();
  const previous = lastWarningAt[reason];
  if (previous !== undefined && now - previous < WARNING_INTERVAL_MS) return;
  lastWarningAt[reason] = now;
  try {
    // Next's removeConsole setting strips console.warn in production. Emit only a
    // static operational status to stderr, at most once per minute per process.
    process.stderr.write(reason === "misconfigured"
      ? "[book-counter] enabled but misconfigured\n"
      : "[book-counter] unavailable\n");
  } catch {
    // Logging failure must never block retailer navigation.
  }
}

export function isBookRetailer(value: string): value is BookRetailer {
  return value === "fnac" || value === "amazon";
}

/** One bounded, non-retried aggregate increment; no browser/request data is accepted. */
export async function countBookRedirect(retailer: BookRetailer): Promise<BookCounterResult> {
  if (!isBookRetailer(retailer)) return "unavailable";
  if (process.env.BOOK_COUNTER_ENABLED !== "true") return "disabled";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const counterToken = process.env.BOOK_COUNTER_TOKEN;
  if (!url || !publishableKey || !counterToken || counterToken.length < 32 || counterToken.length > 512) {
    warnCounterIssue("misconfigured");
    return "disabled";
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const client = createClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // A write may have committed even if its response was lost: never retry it.
    const increment = Promise.resolve(
      client.rpc("increment_book_redirect_count", { p_retailer: retailer, p_token: counterToken })
        .abortSignal(controller.signal)
    ).then<BookCounterResult>(
      ({ error }) => error ? "unavailable" : "recorded"
    ).catch((): BookCounterResult => "unavailable");

    const deadline = new Promise<BookCounterResult>((resolve) => {
      timer = setTimeout(() => {
        resolve("unavailable");
        controller.abort();
      }, BOOK_COUNTER_TIMEOUT_MS);
    });

    const result = await Promise.race([increment, deadline]);
    if (result === "unavailable") warnCounterIssue("unavailable");
    return result;
  } catch {
    // The retailer remains accessible when configuration or storage is unavailable.
    warnCounterIssue("unavailable");
    return "unavailable";
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
