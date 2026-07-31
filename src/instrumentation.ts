/**
 * Runs once at Node server boot (next start).
 * Caps sharp/libvips memory so /_next/image and upload-media stay within 512 MiB.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const sharp = (await import("sharp")).default;
    sharp.cache(false);
    sharp.concurrency(1);
  }
}
