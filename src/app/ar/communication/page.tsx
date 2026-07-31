import type { Metadata } from "next";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import CommunicationPageClient from "@/app/communication/CommunicationPageClient";
import { LANGUAGE_ALTERNATES, pickLocalizedText } from "@/lib/locale";
import { excerptFromHtml } from "@/lib/utils";

const SITE_URL = "https://melloulandpartners.com";
const DEFAULT_TITLE = "التواصل | Melloul & Partners";
const DEFAULT_DESC =
  "الظهور الإعلامي والمقابلات وآراء Melloul & Partners.";
const FALLBACK_IMAGE = `${SITE_URL}/logo-gold.webp`;

function thumbnailUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return FALLBACK_IMAGE;
  return `${base}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`;
}

function videoFileUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`;
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const videoId =
    typeof searchParams.video === "string" ? searchParams.video : undefined;
  const articleId =
    typeof searchParams.article === "string" ? searchParams.article : undefined;

  let ogTitle = DEFAULT_TITLE;
  let ogDesc = DEFAULT_DESC;
  let ogImage = FALLBACK_IMAGE;
  let ogUrl = `${SITE_URL}/ar/communication`;

  if (videoId && supabase) {
    let { data, error } = await supabase
      .from("videos")
      .select(
        "title,title_en,title_ar,description,description_en,description_ar,thumbnail_path"
      )
      .eq("id", videoId)
      .eq("is_published", true)
      .single();

    if (error?.message?.includes("title_ar")) {
      const fallback = await supabase
        .from("videos")
        .select("title,title_en,description,description_en,thumbnail_path")
        .eq("id", videoId)
        .eq("is_published", true)
        .single();
      data = fallback.data as typeof data;
    }

    if (data) {
      ogTitle = pickLocalizedText(data, "title", "ar") + " | Melloul & Partners";
      ogDesc = pickLocalizedText(data, "description", "ar") || DEFAULT_DESC;
      ogImage = data.thumbnail_path
        ? thumbnailUrl(data.thumbnail_path)
        : FALLBACK_IMAGE;
      ogUrl = `${SITE_URL}/ar/communication?video=${videoId}`;
    }
  } else if (articleId && supabase) {
    let { data, error } = await supabase
      .from("articles")
      .select("title,title_en,title_ar,content,content_en,content_ar,image_path")
      .eq("id", articleId)
      .eq("is_published", true)
      .single();

    if (error?.message?.includes("title_ar")) {
      const fallback = await supabase
        .from("articles")
        .select("title,title_en,content,content_en,image_path")
        .eq("id", articleId)
        .eq("is_published", true)
        .single();
      data = fallback.data as typeof data;
    }

    if (data) {
      ogTitle = pickLocalizedText(data, "title", "ar") + " | Melloul & Partners";
      ogDesc = excerptFromHtml(
        pickLocalizedText(data, "content", "ar") || DEFAULT_DESC,
        160
      );
      ogImage = data.image_path
        ? thumbnailUrl(data.image_path)
        : FALLBACK_IMAGE;
      ogUrl = `${SITE_URL}/ar/communication?article=${articleId}`;
    }
  }

  return {
    title: ogTitle,
    description: ogDesc,
    alternates: {
      canonical: "/ar/communication",
      languages: {
        ...LANGUAGE_ALTERNATES,
        en: "/communication",
        fr: "/fr/communication",
        ar: "/ar/communication",
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: ogUrl,
      locale: "ar_AE",
      type: "website",
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: [ogImage],
    },
  };
}

async function buildSchemaAr() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/ar/communication#webpage`,
      url: `${SITE_URL}/ar/communication`,
      name: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      inLanguage: "ar",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "الرئيسية",
          item: `${SITE_URL}/ar`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "التواصل",
          item: `${SITE_URL}/ar/communication`,
        },
      ],
    },
  ];

  if (!supabase) return { "@context": "https://schema.org", "@graph": graph };

  const [videosRes, articlesRes] = await Promise.all([
    (async () => {
      const withAr = await supabase
        .from("videos")
        .select(
          "id,title,title_en,title_ar,description,description_en,description_ar,thumbnail_path,video_path,external_url,created_at,updated_at"
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (withAr.error?.message?.includes("title_ar")) {
        return supabase
          .from("videos")
          .select(
            "id,title,title_en,description,description_en,thumbnail_path,video_path,external_url,created_at,updated_at"
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false });
      }
      return withAr;
    })(),
    (async () => {
      const withAr = await supabase
        .from("articles")
        .select(
          "id,slug,title,title_en,title_ar,content,content_en,content_ar,image_path,created_at,updated_at"
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (withAr.error?.message?.includes("title_ar")) {
        return supabase
          .from("articles")
          .select(
            "id,slug,title,title_en,content,content_en,image_path,created_at,updated_at"
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false });
      }
      return withAr;
    })(),
  ]);

  const videos = videosRes.data ?? [];
  const articles = articlesRes.data ?? [];

  videos.forEach((v) => {
    const thumb = v.thumbnail_path
      ? thumbnailUrl(v.thumbnail_path)
      : FALLBACK_IMAGE;
    const contentUrl =
      v.external_url || (v.video_path ? videoFileUrl(v.video_path) : "");
    const name = pickLocalizedText(v, "title", "ar");
    const description = pickLocalizedText(v, "description", "ar") || name;

    graph.push({
      "@type": "VideoObject",
      name,
      description,
      thumbnailUrl: thumb,
      uploadDate: v.created_at,
      inLanguage: "ar",
      ...(contentUrl && { contentUrl }),
      url: `${SITE_URL}/ar/communication?video=${v.id}`,
      publisher: {
        "@type": "Organization",
        name: "Melloul & Partners",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/only_gold_logo.webp`,
        },
      },
    });
  });

  if (articles.length > 0) {
    graph.push({
      "@type": "ItemList",
      name: "Articles — Melloul & Partners",
      numberOfItems: articles.length,
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/ar/communication/articles/${a.slug ?? a.id}`,
        name: pickLocalizedText(a, "title", "ar"),
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function CommunicationArPage() {
  const schema = await buildSchemaAr();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CommunicationPageClient />
    </>
  );
}
