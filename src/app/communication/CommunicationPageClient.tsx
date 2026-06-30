"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import { htmlToPlainText } from "@/lib/utils";
import { toast } from "sonner";
import { pickLocalizedText, hasLocalizedText, Locale, buildLocalizedPath, LOCALE_PREFIX } from "@/lib/locale";

const pageTranslations = {
  en: {
    title: "Communication",
    subtitle:
      "Media appearances, interviews, and insights from Melloul & Partners",
    backToHome: "Back to Home",
    watchVideo: "Watch Video",
    articlesTitle: "Posts",
    videosTitle: "Videos",
    loading: "Loading…",
    empty: "No videos available yet.",
    emptyArticles: "No posts available yet.",
    share: "Share",
    linkCopied: "Link copied to clipboard!",
    copyLink: "Copy link",
    tapToUnmute: "Tap to unmute",
    readArticle: "Read article",
    externalLink: "Link",
  },
  fr: {
    title: "Communication",
    subtitle:
      "Apparitions médiatiques, interviews et perspectives de Melloul & Partners",
    backToHome: "Retour à l'accueil",
    watchVideo: "Regarder",
    articlesTitle: "Articles",
    videosTitle: "Vidéos",
    loading: "Chargement…",
    empty: "Aucune vidéo disponible pour le moment.",
    emptyArticles: "Aucun article disponible pour le moment.",
    share: "Partager",
    linkCopied: "Lien copié !",
    copyLink: "Copier le lien",
    tapToUnmute: "Activer le son",
    readArticle: "Lire l'article",
    externalLink: "Lien",
  },
  ar: {
    title: "التواصل",
    subtitle:
      "الظهور الإعلامي والمقابلات وآراء Melloul & Partners",
    backToHome: "العودة إلى الصفحة الرئيسية",
    watchVideo: "مشاهدة الفيديو",
    articlesTitle: "المقالات",
    videosTitle: "الفيديوهات",
    loading: "جارٍ التحميل…",
    empty: "لا توجد فيديوهات متاحة حالياً.",
    emptyArticles: "لا توجد مقالات متاحة حالياً.",
    share: "مشاركة",
    linkCopied: "تم نسخ الرابط!",
    copyLink: "نسخ الرابط",
    tapToUnmute: "اضغط لتشغيل الصوت",
    readArticle: "قراءة المقال",
    externalLink: "رابط",
  },
} as const;

type Translations = (typeof pageTranslations)[keyof typeof pageTranslations];

function getShareUrl(type: "video" | "article", id: string, locale: Locale) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const prefix = LOCALE_PREFIX[locale];
  return `${origin}${prefix}/communication?${type}=${id}`;
}

interface Video {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  videoUrl: string;
  externalUrl: string | null;
}

interface VideoDbRow {
  id: string;
  title: string;
  description: string | null;
  title_en: string | null;
  description_en: string | null;
  video_path: string;
  thumbnail_path: string;
  external_url: string | null;
}

interface ArticleDbRow {
  id: string;
  slug: string | null;
  title: string;
  content: string;
  title_en: string | null;
  content_en: string | null;
  image_path: string;
  external_url: string | null;
}

interface Article {
  id: string;
  slug: string | null;
  title: string;
  content: string;
  image: string;
  externalUrl: string | null;
}

export default function CommunicationPageClient() {
  const { locale } = useLanguage();
  const t = pageTranslations[locale];
  const searchParams = useSearchParams();
  const videoParam = searchParams.get("video");
  const [videos, setVideos] = useState<Video[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Video | null>(null);
  const deepLinkHandled = useRef(false);
  const client = supabase;
  const supabaseReady = Boolean(client);

  const bucket = SUPABASE_MEDIA_BUCKET;
  const getPublicUrl = useMemo(
    () => (path: string) =>
      client?.storage.from(bucket).getPublicUrl(path).data.publicUrl ?? "",
    [bucket, client]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!supabaseReady) {
        setLoading(false);
        toast.error(
          "Supabase n'est pas configuré. Vérifie les variables d'environnement du déploiement."
        );
        return;
      }

      setLoading(true);
      const [videosRes, articlesRes] = await Promise.all([
        client!
          .from("videos")
          .select(
            "id,title,description,title_en,description_en,video_path,thumbnail_path,external_url,is_published,sort_order,created_at"
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false }),
        client!
          .from("articles")
          .select(
            "id,slug,title,content,title_en,content_en,image_path,external_url,is_published,sort_order,created_at"
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      setLoading(false);

      if (videosRes.error) {
        toast.error(
          `Impossible de charger les vidéos: ${videosRes.error.message}`
        );
        setVideos([]);
      }
      if (articlesRes.error) {
        toast.error(
          `Impossible de charger les articles: ${articlesRes.error.message}`
        );
        setArticles([]);
      }

      const videoRows = (videosRes.data ?? []) as VideoDbRow[];
      const articleRows = (articlesRes.data ?? []) as ArticleDbRow[];

      const mapped = videoRows
        .filter((row) =>
          hasLocalizedText(row as unknown as Record<string, unknown>, "title", locale)
        )
        .map((row) => ({
          id: row.id,
          thumbnail: getPublicUrl(row.thumbnail_path),
          title: pickLocalizedText(row as unknown as Record<string, unknown>, "title", locale),
          description: pickLocalizedText(row as unknown as Record<string, unknown>, "description", locale),
          videoUrl: getPublicUrl(row.video_path),
          externalUrl: row.external_url ?? null,
        }));
      const mappedArticles = articleRows
        .filter((row) =>
          hasLocalizedText(row as unknown as Record<string, unknown>, "title", locale)
        )
        .map((row) => ({
          id: row.id,
          slug: row.slug ?? null,
          title: pickLocalizedText(row as unknown as Record<string, unknown>, "title", locale),
          content: pickLocalizedText(row as unknown as Record<string, unknown>, "content", locale),
          image: getPublicUrl(row.image_path),
          externalUrl: row.external_url ?? null,
        }));

      setVideos(mapped);
      setArticles(mappedArticles);

      if (videoParam && !deepLinkHandled.current) {
        const target = mapped.find((v) => v.id === videoParam);
        if (target) {
          deepLinkHandled.current = true;
          if (target.externalUrl) {
            window.open(target.externalUrl, "_blank", "noopener,noreferrer");
          } else {
            setActive(target);
          }
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getPublicUrl, supabaseReady, locale, videoParam]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-navy-950 pt-40 pb-24">
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href={buildLocalizedPath("/", locale)}
              className="inline-flex items-center gap-2 text-primary-400 hover:text-gold-500 transition-colors"
            >
              <span>←</span>
              <span>{t.backToHome}</span>
            </Link>
          </motion.div>

          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="w-6 h-[1px] bg-gold-400" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-100">
                {t.title}
              </h1>
            </div>
            <p className="text-primary-400 text-lg md:text-xl max-w-2xl">
              {t.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
            {loading ? (
              <div className="text-primary-300 text-sm">{t.loading}</div>
            ) : articles.length === 0 ? (
              <div className="text-primary-300 text-sm">
                {t.emptyArticles}
              </div>
            ) : (
              articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  t={t}
                  locale={locale}
                />
              ))
            )}
          </div>

          <section className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-6 h-[1px] bg-gold-400" />
              <h2 className="text-3xl md:text-4xl font-serif text-primary-100">
                {t.videosTitle}
              </h2>
            </div>
            {loading ? (
              <div className="text-primary-300 text-sm">{t.loading}</div>
            ) : videos.length === 0 ? (
              <div className="text-primary-300 text-sm">{t.empty}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    index={index}
                    t={t}
                    locale={locale}
                    onOpen={() => setActive(video)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {active && (
        <VideoModal video={active} t={t} locale={locale} onClose={() => setActive(null)} />
      )}
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */

const POPOVER_WIDTH = 212;
const POPOVER_ESTIMATED_HEIGHT = 260;
const POPOVER_GAP = 6;

function SharePopover({
  url,
  title,
  t,
  onClose,
  anchorRect,
}: {
  url: string;
  title: string;
  t: Translations;
  onClose: () => void;
  anchorRect: DOMRect;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or scroll
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onClose]);

  // Position: prefer below-right-aligned, flip up/left if needed
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const spaceBelow = vh - anchorRect.bottom;
  const openAbove = spaceBelow < POPOVER_ESTIMATED_HEIGHT + POPOVER_GAP;

  const top = openAbove
    ? anchorRect.top - POPOVER_ESTIMATED_HEIGHT - POPOVER_GAP
    : anchorRect.bottom + POPOVER_GAP;

  // Right-align to anchor, but clamp so it doesn't overflow viewport
  const idealRight = vw - anchorRect.right;
  const right = Math.max(8, Math.min(idealRight, vw - POPOVER_WIDTH - 8));

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socials = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      color: "text-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      color: "text-white",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "text-[#1877F2]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: "text-[#0A66C2]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t.linkCopied);
      onClose();
    });
  };

  const popover = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: openAbove ? -6 : 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: openAbove ? -6 : 6, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{ position: "fixed", top, right, width: POPOVER_WIDTH, zIndex: 9999 }}
      className="bg-navy-900 border border-gold-500/20 rounded-xl shadow-2xl py-2 overflow-hidden"
    >
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-navy-800 transition-colors"
          onClick={onClose}
        >
          <span className={s.color}>{s.icon}</span>
          <span className="text-sm text-primary-200">{s.name}</span>
        </a>
      ))}
      <div className="border-t border-gold-500/10 mt-1 pt-1">
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-navy-800 transition-colors w-full text-left"
        >
          <svg
            className="w-5 h-5 text-primary-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-sm text-primary-200">{t.copyLink}</span>
        </button>
      </div>
    </motion.div>
  );

  return createPortal(popover, document.body);
}

/* ------------------------------------------------------------------ */

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.368-2.684 3 3 0 0 0-5.368 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function VideoCard({
  video,
  index,
  t,
  locale,
  onOpen,
}: {
  video: Video;
  index: number;
  t: Translations;
  locale: Locale;
  onOpen: () => void;
}) {
  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const isExternal = Boolean(video.externalUrl);

  const handleClick = () => {
    if (isExternal) {
      window.open(video.externalUrl!, "_blank", "noopener,noreferrer");
    } else {
      onOpen();
    }
  };

  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="relative aspect-video mb-3 overflow-hidden rounded-xl bg-navy-800 w-full text-left"
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isExternal && (
          <div className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-1 flex items-center gap-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-white text-[10px] font-medium">
              {t.externalLink}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className={[
              "w-12 h-12 rounded-full flex items-center justify-center",
              isExternal ? "bg-white/90" : "bg-gold-500/90",
            ].join(" ")}
          >
            {isExternal ? (
              <svg
                className="w-5 h-5 text-navy-950"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-navy-950 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent pointer-events-none" />
      </button>

      <h3 className="text-sm md:text-base font-medium text-primary-100 leading-snug line-clamp-2 mb-1 group-hover:text-gold-400 transition-colors">
        {video.title}
      </h3>
      {video.description && (
        <p className="text-xs md:text-sm text-primary-400 line-clamp-2 mb-2">
          {video.description}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="text-gold-500 text-xs font-medium tracking-wider uppercase hover:text-gold-400 transition-colors"
        >
          {isExternal ? `${t.readArticle} →` : `${t.watchVideo} →`}
        </button>
        <button
          ref={shareButtonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const rect = shareButtonRef.current?.getBoundingClientRect() ?? null;
            setShareAnchor(shareAnchor ? null : rect);
          }}
          className="inline-flex items-center gap-1 text-primary-400 hover:text-gold-400 text-xs transition-colors"
        >
          <ShareIcon className="w-3.5 h-3.5" />
          {t.share}
        </button>
        <AnimatePresence>
          {shareAnchor && (
            <SharePopover
              url={isExternal ? video.externalUrl! : getShareUrl("video", video.id, locale)}
              title={video.title}
              t={t}
              anchorRect={shareAnchor}
              onClose={() => setShareAnchor(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */

function VideoModal({
  video,
  t,
  locale,
  onClose,
}: {
  video: Video;
  t: Translations;
  locale: Locale;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [ratio, setRatio] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const attemptPlay = async () => {
      try {
        el.muted = false;
        await el.play();
        setIsMuted(false);
      } catch {
        el.muted = true;
        setIsMuted(true);
        try {
          await el.play();
        } catch {
          /* user will use controls */
        }
      }
    };

    if (el.readyState >= 3) {
      attemptPlay();
    } else {
      el.addEventListener("canplay", attemptPlay, { once: true });
      return () => el.removeEventListener("canplay", attemptPlay);
    }
  }, []);

  const handleMetadata = () => {
    const el = videoRef.current;
    if (el?.videoWidth && el?.videoHeight) {
      setRatio(el.videoWidth / el.videoHeight);
    }
  };

  const isPortrait = ratio !== null && ratio < 1;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-2xl overflow-visible border border-gold-500/10 bg-navy-950/95 transition-[max-width] duration-300"
        style={{
          maxWidth: isPortrait
            ? `min(24rem, calc(75vh * ${ratio}))`
            : "64rem",
        }}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gold-500/10">
          <div className="min-w-0">
            <div className="text-primary-100 font-medium truncate text-sm md:text-base">
              {video.title}
            </div>
            {video.description && (
              <div className="text-primary-400 text-xs md:text-sm truncate">
                {video.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div>
              <button
                ref={shareButtonRef}
                type="button"
                onClick={() => {
                  const rect = shareButtonRef.current?.getBoundingClientRect() ?? null;
                  setShareAnchor(shareAnchor ? null : rect);
                }}
                className="inline-flex items-center gap-1.5 text-primary-400 hover:text-gold-400 text-sm transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                {t.share}
              </button>
              <AnimatePresence>
                {shareAnchor && (
                  <SharePopover
                    url={getShareUrl("video", video.id, locale)}
                    title={video.title}
                    t={t}
                    anchorRect={shareAnchor}
                    onClose={() => setShareAnchor(null)}
                  />
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-primary-400 hover:text-gold-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="bg-black relative overflow-hidden rounded-b-2xl"
          style={{ aspectRatio: ratio ? `${ratio}` : "16/9" }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="inline-flex w-10 h-10 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          )}

          {isMuted && (
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = false;
                  setIsMuted(false);
                }
              }}
              className="absolute bottom-16 left-4 z-20 flex items-center gap-2 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-lg text-xs md:text-sm transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
              {t.tapToUnmute}
            </button>
          )}

          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            poster={video.thumbnail}
            onLoadedMetadata={handleMetadata}
            onLoadStart={() => setIsLoading(true)}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onCanPlayThrough={() => setIsLoading(false)}
            onLoadedData={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ArticleCard({
  article,
  index,
  t,
  locale,
}: {
  article: Article;
  index: number;
  t: Translations;
  locale: Locale;
}) {
  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const isExternal = Boolean(article.externalUrl);

  const articlePath = article.slug
    ? `/communication/articles/${article.slug}`
    : `/communication/articles/${article.id}`;
  const internalHref = buildLocalizedPath(articlePath, locale);

  const thumbnail = (
    <div className="relative aspect-video mb-3 overflow-hidden rounded-xl bg-navy-800 w-full">
      <Image
        src={article.image}
        alt={article.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {isExternal && (
        <div className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-1 flex items-center gap-1">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="text-white text-[10px] font-medium">
            {t.externalLink}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent pointer-events-none" />
    </div>
  );

  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
    >
      {isExternal ? (
        <a
          href={article.externalUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {thumbnail}
        </a>
      ) : (
        <Link href={internalHref} className="block">
          {thumbnail}
        </Link>
      )}

      {isExternal ? (
        <h3 className="text-sm md:text-base font-medium text-primary-100 leading-snug line-clamp-2 mb-1 group-hover:text-gold-400 transition-colors">
          {article.title}
        </h3>
      ) : (
        <Link href={internalHref}>
          <h3 className="text-sm md:text-base font-medium text-primary-100 leading-snug line-clamp-2 mb-1 group-hover:text-gold-400 transition-colors">
            {article.title}
          </h3>
        </Link>
      )}

      {article.content ? (
        <p className="text-xs md:text-sm text-primary-400 line-clamp-3 mb-2 whitespace-pre-line">
          {htmlToPlainText(article.content)}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {isExternal ? (
          <a
            href={article.externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 text-xs font-medium tracking-wider uppercase hover:text-gold-400 transition-colors"
          >
            {t.readArticle} →
          </a>
        ) : (
          <Link
            href={internalHref}
            className="text-gold-500 text-xs font-medium tracking-wider uppercase hover:text-gold-400 transition-colors"
          >
            {t.readArticle} →
          </Link>
        )}
        <button
          ref={shareButtonRef}
          type="button"
          onClick={() => {
            const rect = shareButtonRef.current?.getBoundingClientRect() ?? null;
            setShareAnchor(shareAnchor ? null : rect);
          }}
          className="inline-flex items-center gap-1 text-primary-400 hover:text-gold-400 text-xs transition-colors"
        >
          <ShareIcon className="w-3.5 h-3.5" />
          {t.share}
        </button>
        <AnimatePresence>
          {shareAnchor && (
            <SharePopover
              url={
                isExternal
                  ? article.externalUrl!
                  : `https://melloulandpartners.com${internalHref}`
              }
              title={article.title}
              t={t}
              anchorRect={shareAnchor}
              onClose={() => setShareAnchor(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
