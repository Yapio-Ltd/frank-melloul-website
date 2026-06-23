import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://melloulandpartners.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/fr`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/communication`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/fr/communication`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ar/communication`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/fr/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/ar/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  if (!supabase) return staticPages;

  const { data: articles } = await supabase
    .from("articles")
    .select("id,slug,updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).flatMap(
    (article) => {
      const identifier = article.slug ?? article.id;
      return [
        {
          url: `${baseUrl}/communication/articles/${identifier}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/fr/communication/articles/${identifier}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/ar/communication/articles/${identifier}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    }
  );

  return [...staticPages, ...articlePages];
}

