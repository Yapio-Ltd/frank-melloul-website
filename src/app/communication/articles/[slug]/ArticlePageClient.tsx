"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Locale,
  LOCALE_PREFIX,
  buildLocalizedPath,
  getIntlLocale,
  pickLocalizedText,
} from "@/lib/locale";

const articleLabels = {
  en: {
    back: "← Back to Communication",
    loading: "Loading…",
    notFound: "Article not found.",
    by: "By",
    role: "Founder & Partner, Melloul & Partners",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied to clipboard!",
    mayInterest: "May Interest You",
    home: "Home",
    viewAll: "View all articles",
  },
  fr: {
    back: "← Retour à Communication",
    loading: "Chargement…",
    notFound: "Article introuvable.",
    by: "Par",
    role: "Fondateur & Associé, Melloul & Partners",
    share: "Partager",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié !",
    mayInterest: "Peut vous intéresser",
    home: "Accueil",
    viewAll: "Voir tous les articles",
  },
  ar: {
    back: "← العودة إلى التواصل",
    loading: "جارٍ التحميل…",
    notFound: "المقال غير موجود.",
    by: "بقلم",
    role: "المؤسس والشريك، Melloul & Partners",
    share: "مشاركة",
    copyLink: "نسخ الرابط",
    linkCopied: "تم نسخ الرابط!",
    mayInterest: "قد يهمّك أيضاً",
    home: "الرئيسية",
    viewAll: "عرض جميع المقالات",
  },
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ArticleData {
  id: string;
  slug: string | null;
  title: string;
  content: string;
  image_path: string;
  created_at: string;
}

interface RelatedArticle {
  id: string;
  slug: string | null;
  title: string;
  image_path: string;
  created_at: string;
}
type RelatedArticleQueryRow = {
  id: string;
  slug: string | null;
  title: string;
  title_en: string | null;
  image_path: string;
  created_at: string;
};

function getPublicUrl(path: string) {
  return (
    supabase?.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(path).data
      .publicUrl ?? ""
  );
}

function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function formatDateShort(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export default function ArticlePageClient({
  identifier,
  locale,
}: {
  identifier: string;
  locale: Locale;
}) {
  const isId = UUID_RE.test(identifier);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const labels = articleLabels[locale];
  const backHref = buildLocalizedPath("/communication", locale);
  const homeHref = buildLocalizedPath("/", locale);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const filterCol = isId ? "id" : "slug";

    supabase
      .from("articles")
      .select("id,slug,title,content,title_en,content_en,image_path,created_at")
      .eq(filterCol, identifier)
      .eq("is_published", true)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) {
          setNotFound(true);
          return;
        }
        setArticle({
          id: data.id,
          slug: data.slug ?? null,
          title: pickLocalizedText(data, "title", locale),
          content: pickLocalizedText(data, "content", locale),
          image_path: data.image_path,
          created_at: data.created_at,
        });
      });

    supabase
      .from("articles")
      .select("id,slug,title,title_en,image_path,created_at")
      .eq("is_published", true)
      .neq(filterCol, identifier)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (!data) return;
        setRelatedArticles(
          (data as RelatedArticleQueryRow[]).map((a) => ({
            id: a.id,
            slug: a.slug ?? null,
            title: pickLocalizedText(a, "title", locale),
            image_path: a.image_path,
            created_at: a.created_at,
          }))
        );
      });
  }, [identifier, locale, isId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-navy-950 pb-24">

        {loading ? (
          <div className="relative z-10 pt-40 container mx-auto px-6 md:px-12 lg:px-20">
            <p className="text-primary-400 text-sm">{labels.loading}</p>
          </div>
        ) : notFound ? (
          <div className="relative z-10 pt-40 container mx-auto px-6 md:px-12 lg:px-20">
            <p className="text-primary-400 text-sm">{labels.notFound}</p>
            <Link
              href={backHref}
              className="mt-4 inline-block text-gold-500 hover:text-gold-400 text-sm transition-colors"
            >
              {labels.back}
            </Link>
          </div>
        ) : article ? (
          <>
            {/* Hero image */}
            <div className="relative w-full h-[60vh] overflow-hidden">
              <Image
                src={getPublicUrl(article.image_path)}
                alt={article.title}
                fill
                sizes="100vw"
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-navy-950" />
            </div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">

              {/* Breadcrumbs */}
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                aria-label="breadcrumb"
                className="-mt-4 mb-8"
              >
                <ol className="flex items-center gap-2 text-xs text-primary-500 flex-wrap">
                  <li>
                    <Link href={homeHref} className="hover:text-gold-400 transition-colors">
                      {labels.home}
                    </Link>
                  </li>
                  <li className="text-primary-700">/</li>
                  <li>
                    <Link href={backHref} className="hover:text-gold-400 transition-colors">
                      Communication
                    </Link>
                  </li>
                  <li className="text-primary-700">/</li>
                  <li className="text-primary-400 truncate max-w-[200px] sm:max-w-xs md:max-w-sm" aria-current="page">
                    {article.title}
                  </li>
                </ol>
              </motion.nav>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-12 xl:gap-16 items-start">

                {/* ── Main content ── */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                  >
                    <Link
                      href={backHref}
                      className="inline-flex items-center gap-2 text-primary-400 hover:text-gold-500 text-sm transition-colors"
                    >
                      <span>←</span>
                      <span>{labels.back.replace("← ", "")}</span>
                    </Link>
                  </motion.div>

                  <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {/* Date */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-5 h-[1px] bg-gold-400" />
                      <time className="text-primary-500 text-xs tracking-wider uppercase">
                        {formatDate(article.created_at, locale)}
                      </time>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary-100 leading-tight mb-6">
                      {article.title}
                    </h1>

                    {/* Share button */}
                    <div className="mb-8">
                      <button
                        ref={shareButtonRef}
                        type="button"
                        onClick={() => {
                          const rect = shareButtonRef.current?.getBoundingClientRect() ?? null;
                          setShareAnchor(shareAnchor ? null : rect);
                        }}
                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/20 bg-navy-900/60 hover:border-gold-500/40 hover:bg-navy-800/80 text-primary-300 hover:text-gold-400 text-sm transition-all duration-200"
                      >
                        <ShareIcon className="w-4 h-4" />
                        {labels.share}
                      </button>
                      <AnimatePresence>
                        {shareAnchor && (
                          <ArticleSharePopover
                            url={getArticleUrl(article.slug ?? article.id, locale)}
                            title={article.title}
                            copyLinkLabel={labels.copyLink}
                            linkCopiedLabel={labels.linkCopied}
                            anchorRect={shareAnchor}
                            onClose={() => setShareAnchor(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Gold divider */}
                    <div className="w-12 h-[2px] bg-gold-500 mb-10" />

                    {/* Body content */}
                    {article.content.trimStart().startsWith("<") ? (
                      <div
                        className="article-rich-content text-base md:text-lg"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    ) : (
                      <div className="text-primary-300 text-base md:text-lg leading-relaxed whitespace-pre-line space-y-6">
                        {article.content.split(/\n{2,}/).map((paragraph, i) => (
                          <p key={i} className="text-primary-300 leading-[1.85]">
                            {paragraph.trim()}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Author signature */}
                    <footer className="mt-16 pt-8 border-t border-gold-500/20">
                      <div className="flex items-center gap-4">
                        <Image
                          src="/avatar_to_circle.webp"
                          alt="Frank Melloul"
                          width={48}
                          height={48}
                          className="rounded-full object-cover shrink-0 ring-2 ring-gold-500/30"
                        />
                        <div>
                          <p className="text-xs text-primary-500 uppercase tracking-widest mb-0.5">
                            {labels.by}
                          </p>
                          <p className="text-primary-100 font-serif text-lg leading-tight">
                            Frank Melloul
                          </p>
                          <p className="text-primary-500 text-sm mt-0.5">
                            {labels.role}
                          </p>
                        </div>
                      </div>
                    </footer>
                  </motion.article>
                </div>

                {/* ── Sidebar ── */}
                {relatedArticles.length > 0 && (
                  <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="lg:sticky lg:top-28 self-start"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-5 h-[1px] bg-gold-400 shrink-0" />
                      <h2 className="text-gold-400 text-xs font-semibold tracking-[0.18em] uppercase">
                        {labels.mayInterest}
                      </h2>
                    </div>

                    <div className="space-y-5">
                      {relatedArticles.map((rel) => {
                        const relIdentifier = rel.slug ?? rel.id;
                        const articleHref = buildLocalizedPath(
                          `/communication/articles/${relIdentifier}`,
                          locale
                        );
                        return (
                          <Link
                            key={rel.id}
                            href={articleHref}
                            className="group flex gap-3 items-start p-3 rounded-lg border border-gold-500/10 bg-navy-900/40 hover:border-gold-500/30 hover:bg-navy-800/60 transition-all duration-200"
                          >
                            {rel.image_path && (
                              <div className="relative w-20 h-16 shrink-0 overflow-hidden rounded-md">
                                <Image
                                  src={getPublicUrl(rel.image_path)}
                                  alt={rel.title}
                                  fill
                                  sizes="80px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <time className="text-primary-600 text-[10px] tracking-wider uppercase block mb-1">
                                {formatDateShort(rel.created_at, locale)}
                              </time>
                              <p className="text-primary-200 text-sm leading-snug font-serif group-hover:text-gold-300 transition-colors line-clamp-3">
                                {rel.title}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-gold-500/10">
                      <Link
                        href={backHref}
                        className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-300 text-xs tracking-wider uppercase font-medium transition-colors"
                      >
                        <span>{labels.viewAll}</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </motion.aside>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */

function getArticleUrl(slug: string, locale: Locale) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const prefix = LOCALE_PREFIX[locale];
  return `${origin}${prefix}/communication/articles/${slug}`;
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

const POPOVER_WIDTH = 212;
const POPOVER_ESTIMATED_HEIGHT = 260;
const POPOVER_GAP = 6;

function ArticleSharePopover({
  url,
  title,
  copyLinkLabel,
  linkCopiedLabel,
  onClose,
  anchorRect,
}: {
  url: string;
  title: string;
  copyLinkLabel: string;
  linkCopiedLabel: string;
  onClose: () => void;
  anchorRect: DOMRect;
}) {
  const ref = useRef<HTMLDivElement>(null);

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

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const spaceBelow = vh - anchorRect.bottom;
  const openAbove = spaceBelow < POPOVER_ESTIMATED_HEIGHT + POPOVER_GAP;

  const topPos = openAbove
    ? anchorRect.top - POPOVER_ESTIMATED_HEIGHT - POPOVER_GAP
    : anchorRect.bottom + POPOVER_GAP;

  const leftPos = Math.max(8, Math.min(anchorRect.left, vw - POPOVER_WIDTH - 8));

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
      toast.success(linkCopiedLabel);
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
      style={{ position: "fixed", top: topPos, left: leftPos, width: POPOVER_WIDTH, zIndex: 9999 }}
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
          <span className="text-sm text-primary-200">{copyLinkLabel}</span>
        </button>
      </div>
    </motion.div>
  );

  return createPortal(popover, document.body);
}
