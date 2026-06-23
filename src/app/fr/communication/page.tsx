import type { Metadata } from "next";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import CommunicationPageClient from "@/app/communication/CommunicationPageClient";

const SITE_URL = "https://melloulandpartners.com";
const DEFAULT_TITLE = "Communication | Melloul & Partners";
const DEFAULT_DESC =
  "Apparitions médiatiques, interviews et perspectives de Melloul & Partners.";
const FALLBACK_IMAGE = `${SITE_URL}/logo-gold.png`;

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
  let ogUrl = `${SITE_URL}/fr/communication`;

  if (videoId && supabase) {
    const { data } = await supabase
      .from("videos")
      .select("title,description,thumbnail_path")
      .eq("id", videoId)
      .eq("is_published", true)
      .single();

    if (data) {
      ogTitle = data.title + " | Melloul & Partners";
      ogDesc = data.description ?? DEFAULT_DESC;
      ogImage = data.thumbnail_path
        ? thumbnailUrl(data.thumbnail_path)
        : FALLBACK_IMAGE;
      ogUrl = `${SITE_URL}/fr/communication?video=${videoId}`;
    }
  } else if (articleId && supabase) {
    const { data } = await supabase
      .from("articles")
      .select("title,content,image_path")
      .eq("id", articleId)
      .eq("is_published", true)
      .single();

    if (data) {
      ogTitle = data.title + " | Melloul & Partners";
      ogDesc = (data.content ?? DEFAULT_DESC).slice(0, 160);
      ogImage = data.image_path
        ? thumbnailUrl(data.image_path)
        : FALLBACK_IMAGE;
      ogUrl = `${SITE_URL}/fr/communication?article=${articleId}`;
    }
  }

  return {
    title: ogTitle,
    description: ogDesc,
    alternates: {
      canonical: "/fr/communication",
      languages: { en: "/communication", fr: "/fr/communication", ar: "/ar/communication" },
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: ogUrl,
      locale: "fr_FR",
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

async function buildSchemaFr() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/fr/communication#webpage`,
      url: `${SITE_URL}/fr/communication`,
      name: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      inLanguage: "fr",
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/fr` },
        { "@type": "ListItem", position: 2, name: "Communication", item: `${SITE_URL}/fr/communication` },
      ],
    },
  ];

  if (!supabase) return { "@context": "https://schema.org", "@graph": graph };

  const [videosRes, articlesRes] = await Promise.all([
    supabase
      .from("videos")
      .select("id,title,description,thumbnail_path,video_path,external_url,created_at,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("articles")
      .select("id,slug,title,content,image_path,created_at,updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const videos = videosRes.data ?? [];
  const articles = articlesRes.data ?? [];

  videos.forEach((v) => {
    const thumb = v.thumbnail_path ? thumbnailUrl(v.thumbnail_path) : FALLBACK_IMAGE;
    const contentUrl = v.external_url || (v.video_path ? videoFileUrl(v.video_path) : "");

    graph.push({
      "@type": "VideoObject",
      name: v.title,
      description: v.description || v.title,
      thumbnailUrl: thumb,
      uploadDate: v.created_at,
      inLanguage: "fr",
      ...(contentUrl && { contentUrl }),
      url: `${SITE_URL}/fr/communication?video=${v.id}`,
      publisher: {
        "@type": "Organization",
        name: "Melloul & Partners",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/only_gold_logo.png` },
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
        url: `${SITE_URL}/fr/communication/articles/${a.slug ?? a.id}`,
        name: a.title,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function CommunicationFrPage() {
  const schema = await buildSchemaFr();

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
