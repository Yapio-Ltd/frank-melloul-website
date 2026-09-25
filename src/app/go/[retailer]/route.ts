import { createBookCounterRedirectHandlers } from "@/lib/book-counter-redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const handlers = createBookCounterRedirectHandlers();
export const GET = handlers.GET;
export const HEAD = handlers.HEAD;
