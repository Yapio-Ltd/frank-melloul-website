import type { Metadata } from "next";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import { isUUID } from "@/lib/articleQuery";
import { permanentRedirect } from "next/navigation";
import ArticlePageClient from "@/app/communication/articles/[slug]/ArticlePageClient";
import { excerptFromHtml } from "@/lib/utils";
import { LANGUAGE_ALTERNATES } from "@/lib/locale";

const SITE_URL = "https://melloulandpartners.com";
const FALLBACK_IMAGE = `${SITE_URL}/logo-gold.png`;
const META_DESC_MAX = 160;
const ARTICLE_DESC_MAX = 300;

function imageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return FALLBACK_IMAGE;
  return `${base}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`;
}

function cutText(value: string, max: number): string {
  return excerptFromHtml(value, max);
}

type Props = { params: { slug: string } };
type ArticleRow = {
  id: string;
  slug: string | null;
  title: string;
  title_en: string | null;
  content: string;
  content_en: string | null;
  image_path: string;
  created_at: string;
  updated_at: string;
};

const COLS = "id,slug,title,title_en,content,content_en,image_path,created_at,updated_at";

async function getArticle(identifier: string) {
  if (!supabase) return null;

  const col = isUUID(identifier) ? "id" : "slug";
  const { data } = await supabase
    .from("articles")
    .select(COLS)
    .eq(col, identifier)
    .eq("is_published", true)
    .single();

  return data as ArticleRow | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticle(params.slug);
  if (!data) return { title: "Article | Melloul & Partners" };

  const articleSlug = data.slug ?? data.id ?? params.slug;
  const title = (data.title_en ?? data.title) + " | Melloul & Partners";
  const description = cutText(data.content_en ?? data.content ?? "", META_DESC_MAX);
  const ogImage = data.image_path ? imageUrl(data.image_path) : FALLBACK_IMAGE;
  const url = `${SITE_URL}/ar/communication/articles/${articleSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/ar/communication/articles/${articleSlug}`,
      languages: {
        en: `/communication/articles/${articleSlug}`,
        fr: `/fr/communication/articles/${articleSlug}`,
        ar: `/ar/communication/articles/${articleSlug}`,
        "x-default": `/communication/articles/${articleSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: "ar_AE",
      type: "article",
      publishedTime: data.created_at,
      modifiedTime: data.updated_at,
      authors: ["Frank Melloul"],
      section: "Communication",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ArticleArPage({ params }: Props) {
  const data = await getArticle(params.slug);
  if (data?.slug && isUUID(params.slug)) {
    permanentRedirect(`/ar/communication/articles/${data.slug}`);
  }

  const articleSlug = data?.slug ?? data?.id ?? params.slug;
  const ogImage = data?.image_path ? imageUrl(data.image_path) : FALLBACK_IMAGE;
  const articleTitle = data ? (data.title_en ?? data.title) : "";
  const articleDesc = data ? cutText(data.content_en ?? data.content ?? "", ARTICLE_DESC_MAX) : "";

  const jsonLd = data
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: articleTitle,
        description: articleDesc,
        image: ogImage,
        datePublished: data.created_at,
        dateModified: data.updated_at,
        inLanguage: "ar",
        url: `${SITE_URL}/ar/communication/articles/${articleSlug}`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/ar/communication/articles/${articleSlug}`,
        },
        author: {
          "@type": "Person",
          name: "Frank Melloul",
          url: `${SITE_URL}/`,
          jobTitle: "المؤسس",
          worksFor: {
            "@type": "Organization",
            name: "Melloul & Partners",
          },
        },
        publisher: {
          "@type": "Organization",
          name: "Melloul & Partners",
          url: `${SITE_URL}/`,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/only_gold_logo.png`,
          },
        },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticlePageClient identifier={params.slug} locale="ar" />
    </>
  );
}
