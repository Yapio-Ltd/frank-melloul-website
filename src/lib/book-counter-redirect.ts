import "server-only";
import { BOOK_RETAILERS, type BookRetailer } from "./book-links";
import { countBookRedirect, isBookRetailer, type BookCounterResult } from "./book-counter";

type RouteContext = { params: { retailer: string } };
type Counter = (retailer: BookRetailer) => Promise<BookCounterResult>;

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export function createBookCounterRedirectHandlers(counter: Counter = countBookRedirect) {
  async function respond(retailer: string, count: boolean): Promise<Response> {
    if (!isBookRetailer(retailer)) {
      return new Response(null, { status: 404, headers: RESPONSE_HEADERS });
    }
    if (count) {
      try {
        await counter(retailer);
      } catch {
        // Do not expose storage errors or block access to the book.
      }
    }
    return new Response(null, {
      status: 303,
      headers: { ...RESPONSE_HEADERS, Location: BOOK_RETAILERS[retailer].url },
    });
  }

  return {
    // The request is deliberately not inspected: no URL query, headers, cookies or IP.
    GET: (_request: Request, { params }: RouteContext) => respond(params.retailer, true),
    HEAD: (_request: Request, { params }: RouteContext) => respond(params.retailer, false),
  };
}
