/** Exclude arbitrary query values and fragments from measurement payloads. */
export function sanitizeAnalyticsUrl(rawUrl: string, includeCampaign = false): string {
  if (!rawUrl) return "";
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const clean = new URL(url.origin + url.pathname);
    if (includeCampaign) {
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"]) {
        const value = url.searchParams.get(key);
        if (value) clean.searchParams.set(key, value.slice(0, 200));
      }
    }
    return clean.href;
  } catch {
    return "";
  }
}
