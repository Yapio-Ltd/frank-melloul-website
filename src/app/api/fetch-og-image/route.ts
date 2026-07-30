import { NextRequest, NextResponse } from "next/server";

type HeaderProfile = Record<string, string>;

function buildHeaderProfiles(origin: string): HeaderProfile[] {
  return [
    {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "text/html,application/xhtml+xml",
    },
    {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9",
      Referer: origin,
    },
  ];
}

async function fetchWithUaCascade(
  url: string,
  profiles: HeaderProfile[]
): Promise<{ response: Response; headers: HeaderProfile } | { lastStatus: number }> {
  let lastStatus = 0;

  for (const headers of profiles) {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return { response, headers };
    }

    lastStatus = response.status;
  }

  return { lastStatus };
}

function isYouTubeUrl(parsed: URL): boolean {
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  return (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host.endsWith(".youtube.com")
  );
}

function imageResponse(
  imageBuffer: ArrayBuffer,
  contentType: string,
  ogTitle: string,
  ogDescription: string
) {
  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "X-OG-Title": encodeURIComponent(ogTitle),
      "X-OG-Description": encodeURIComponent(ogDescription),
      "Access-Control-Expose-Headers": "X-OG-Title, X-OG-Description",
    },
  });
}

async function fetchYouTubeViaOEmbed(pageUrl: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(pageUrl)}&format=json`;
  const oembedRes = await fetch(oembedUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });

  if (!oembedRes.ok) {
    return null;
  }

  const data = (await oembedRes.json()) as {
    title?: string;
    thumbnail_url?: string;
  };

  const title = data.title?.trim() ?? "";
  const thumbnailUrl = data.thumbnail_url?.trim() ?? "";
  if (!thumbnailUrl) {
    return null;
  }

  const imgRes = await fetch(thumbnailUrl, {
    signal: AbortSignal.timeout(10000),
  });
  if (!imgRes.ok) {
    return null;
  }

  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const imageBuffer = await imgRes.arrayBuffer();

  return imageResponse(imageBuffer, contentType, title, "");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Protocole non autorisé" }, { status: 400 });
  }

  try {
    // YouTube: prefer oEmbed to avoid HTML scrape rate-limits (429)
    if (isYouTubeUrl(parsed)) {
      const yt = await fetchYouTubeViaOEmbed(url);
      if (yt) return yt;
      // fall through to HTML cascade if oEmbed fails
    }

    const profiles = buildHeaderProfiles(parsed.origin);
    const pageResult = await fetchWithUaCascade(url, profiles);

    if (!("response" in pageResult)) {
      return NextResponse.json(
        { error: `Impossible de charger la page (${pageResult.lastStatus})` },
        { status: 502 }
      );
    }

    const { response: pageRes, headers: successHeaders } = pageResult;
    const html = await pageRes.text();

    const getMeta = (patterns: RegExp[]) => {
      for (const re of patterns) {
        const m = html.match(re);
        if (m?.[1]) return m[1].trim();
      }
      return "";
    };

    const ogTitle =
      getMeta([
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
      ]) || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "");

    const ogDescription = getMeta([
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i,
    ]);

    const ogImageMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      ) ||
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
      );

    if (!ogImageMatch?.[1]) {
      return NextResponse.json(
        { error: "Aucune image OG trouvée sur cette page" },
        { status: 404 }
      );
    }

    let imageUrl = ogImageMatch[1];

    if (imageUrl.startsWith("//")) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl.startsWith("/")) {
      imageUrl = `${parsed.origin}${imageUrl}`;
    }

    const imgRes = await fetch(imageUrl, {
      headers: successHeaders,
      signal: AbortSignal.timeout(10000),
    });

    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Impossible de télécharger l'image" },
        { status: 502 }
      );
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imgRes.arrayBuffer();

    return imageResponse(imageBuffer, contentType, ogTitle, ogDescription);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
