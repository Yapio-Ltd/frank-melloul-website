"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase, SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";
import { uploadMedia } from "@/lib/uploadMedia";
import { htmlToPlainText } from "@/lib/utils";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[220px] rounded-xl bg-navy-900/50 border border-gold-500/10 animate-pulse" />
  ),
});

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  title_en?: string | null;
  description_en?: string | null;
  title_ar?: string | null;
  description_ar?: string | null;
  video_path: string;
  thumbnail_path: string;
  external_url?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  title_en?: string | null;
  content_en?: string | null;
  title_ar?: string | null;
  content_ar?: string | null;
  image_path: string;
  external_url?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

type LangFlags = { fr: boolean; en: boolean; ar: boolean };

function inferLangFlags(
  isCreate: boolean,
  titleFr?: string | null,
  titleEn?: string | null,
  titleAr?: string | null
): LangFlags {
  if (isCreate) return { fr: true, en: true, ar: true };
  const fr = Boolean(titleFr?.trim());
  const en = Boolean(titleEn?.trim());
  const ar = Boolean(titleAr?.trim());
  if (!fr && !en && !ar) return { fr: true, en: true, ar: true };
  return { fr, en, ar };
}

function countEnabledLangs(langs: LangFlags): number {
  return (langs.fr ? 1 : 0) + (langs.en ? 1 : 0) + (langs.ar ? 1 : 0);
}

function LanguageCheckboxes({
  langs,
  onChange,
  arDisabled = false,
}: {
  langs: LangFlags;
  onChange: (next: LangFlags) => void;
  arDisabled?: boolean;
}) {
  const toggle = (key: keyof LangFlags) => {
    if (key === "ar" && arDisabled) return;
    const next = { ...langs, [key]: !langs[key] };
    if (countEnabledLangs(next) === 0) {
      toast.error("Sélectionnez au moins une langue.");
      return;
    }
    onChange(next);
  };

  return (
    <div className="md:col-span-2 space-y-2 pt-2 border-b border-gold-500/10 pb-4">
      <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
        Langues publiées
      </div>
      <p className="text-primary-500 text-xs">
        Cochez uniquement les langues souhaitées. Avec une seule langue, le texte
        n’est pas traduit automatiquement.
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-primary-200">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={langs.fr}
            onChange={() => toggle("fr")}
            className="accent-gold-400"
          />
          Français
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={langs.en}
            onChange={() => toggle("en")}
            className="accent-gold-400"
          />
          English
        </label>
        <label
          className={[
            "inline-flex items-center gap-2",
            arDisabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          title={
            arDisabled
              ? "Colonnes arabes absentes en base — exécute scripts/add-arabic-columns.sql"
              : undefined
          }
        >
          <input
            type="checkbox"
            checked={langs.ar}
            onChange={() => toggle("ar")}
            disabled={arDisabled}
            className="accent-gold-400"
          />
          العربية
        </label>
      </div>
      {arDisabled && (
        <p className="text-amber-200/90 text-xs">
          L’arabe est désactivé tant que les colonnes DB manquent (
          <code className="font-mono">scripts/add-arabic-columns.sql</code>).
        </p>
      )}
    </div>
  );
}

function formatDbSaveError(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "object" &&
          err &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Erreur inconnue pendant l'opération.";

  if (
    message.includes("PGRST204") ||
    message.includes("title_ar") ||
    message.includes("content_ar") ||
    message.includes("description_ar")
  ) {
    return "Colonnes arabes manquantes en base. Exécute scripts/add-arabic-columns.sql dans le SQL Editor Supabase, puis réessaie.";
  }
  return message;
}

function getShareUrl(videoId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/communication?video=${videoId}`;
}

function shareVideo(videoId: string) {
  const url = getShareUrl(videoId);
  navigator.clipboard.writeText(url).then(() => {
    toast.success("Lien public copié !");
  });
}

function slugify(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const latin = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  if (latin) return latin;

  // Preserve non-Latin scripts (e.g. Arabic) without Unicode regex flags
  // (TS default target rejects \p{L} / the `u` flag).
  const unicode = trimmed
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  if (unicode) return unicode;

  return `article-${Date.now().toString(36)}`;
}

async function buildUniqueArticleSlug(
  client: NonNullable<typeof supabase>,
  baseSlug: string,
  currentId?: string
) {
  let candidate = baseSlug;
  let index = 2;

  while (true) {
    let query = client.from("articles").select("id").eq("slug", candidate).limit(1);
    if (currentId) query = query.neq("id", currentId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
}

function getArticleShareUrl(article: ArticleRow) {
  if (article.external_url) return article.external_url;
  return `https://melloulandpartners.com/communication/articles/${article.slug}`;
}

function AdminSharePopover({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socials = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "text-[#1877F2]",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      color: "text-[#25D366]",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      color: "text-white",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: "text-[#0A66C2]",
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Lien copié !");
      onClose();
    });
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 bg-navy-900 border border-gold-500/20 rounded-xl shadow-2xl py-2 w-48"
    >
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2 hover:bg-navy-800 transition-colors text-sm"
          onClick={onClose}
        >
          <span className={s.color}>{s.name}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-3 px-4 py-2 hover:bg-navy-800 transition-colors text-sm text-primary-200 w-full text-left"
      >
        Copier le lien
      </button>
    </div>
  );
}

function getPublicUrl(client: NonNullable<typeof supabase>, path: string) {
  const { data } = client.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function AdminPage() {
  const client = supabase;
  const supabaseReady = Boolean(client);
  const [session, setSession] = useState<Awaited<
    ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>
  >["data"]["session"]>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [arColumnsMissing, setArColumnsMissing] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!supabaseReady) {
      toast.error(
        "Supabase n'est pas configuré. Vérifie les variables d'environnement sur Render."
      );
      setLoadingSession(false);
      return () => {
        mounted = false;
      };
    }

    client!
      .from("articles")
      .select("title_ar")
      .limit(1)
      .then(({ error }) => {
        if (!mounted) return;
        if (error?.message?.includes("title_ar")) {
          setArColumnsMissing(true);
        }
      });

    client!.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) toast.error(error.message);
        setSession(data.session ?? null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingSession(false);
      });

    const { data: sub } = client!.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabaseReady]);

  if (loadingSession) {
    return (
      <main className="min-h-screen bg-navy-950 pt-28 pb-20">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-primary-300 text-sm">Chargement…</div>
        </div>
      </main>
    );
  }

  if (!supabaseReady) {
    return (
      <main className="min-h-screen bg-navy-950 pt-28 pb-20">
        <div className="fixed inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
            <div className="font-medium mb-1">Configuration manquante</div>
            <div className="text-sm text-red-100/80">
              Les variables <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              et <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{" "}
              doivent être définies dans Render (au build et au runtime).
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-950 pt-28 pb-20">
      <div className="fixed inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="w-6 h-[1px] bg-gold-400" />
              <h1 className="text-3xl md:text-4xl font-serif text-primary-100">
                Admin · Contenus
              </h1>
            </div>
            <p className="text-primary-400 text-sm max-w-2xl">
              Connexion Supabase Auth requise. Ici tu peux ajouter, éditer et
              publier les vidéos et les articles stockés dans Supabase.
            </p>
            {arColumnsMissing && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100 text-sm max-w-2xl">
                Colonnes arabes absentes en base : la publication FR/EN fonctionne,
                mais l’arabe est désactivé. Exécute{" "}
                <code className="font-mono text-xs">scripts/add-arabic-columns.sql</code>{" "}
                dans le{" "}
                <a
                  href="https://supabase.com/dashboard/project/rhucqyogszkxrngnouyv/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-50"
                >
                  SQL Editor Supabase
                </a>{" "}
                pour activer l’arabe.
              </div>
            )}
          </div>

          <Link
            href="/"
            className="text-primary-300 hover:text-gold-500 text-sm transition-colors"
          >
            ← Retour au site
          </Link>
        </div>

        {!session ? (
          <LoginPanel />
        ) : (
          <div className="space-y-8">
            <ArticlesDashboard arColumnsMissing={arColumnsMissing} />
            <VideosDashboard arColumnsMissing={arColumnsMissing} />
          </div>
        )}
      </div>
    </main>
  );
}

function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      toast.error(`Connexion impossible: ${error.message}`);
      return;
    }
    toast.success("Connecté.");
  };

  return (
    <section className="max-w-md">
      <div className="rounded-2xl border border-gold-500/10 bg-navy-950/60 backdrop-blur p-6">
        <h2 className="text-primary-100 font-medium mb-4">Connexion</h2>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="block text-xs tracking-wider text-primary-400 uppercase">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs tracking-wider text-primary-400 uppercase">
              Mot de passe
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gold-500 text-navy-950 font-medium py-2.5 hover:bg-gold-400 transition-colors disabled:opacity-60"
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </section>
  );
}

function VideosDashboard({
  arColumnsMissing,
}: {
  arColumnsMissing: boolean;
}) {
  const client = supabase!;
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<VideoRow | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await client
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    setLoading(false);
    if (error) {
      toast.error(`Chargement impossible: ${error.message}`);
      return;
    }
    setVideos((data ?? []) as VideoRow[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onLogout = async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      toast.error(`Déconnexion impossible: ${error.message}`);
      return;
    }
    toast.success("Déconnecté.");
  };

  const onTogglePublished = async (row: VideoRow) => {
    const { error } = await client
      .from("videos")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (error) {
      toast.error(`Échec: ${error.message}`);
      return;
    }
    toast.success(row.is_published ? "Dépublié." : "Publié.");
    refresh();
  };

  const onDelete = async (row: VideoRow) => {
    const ok = window.confirm(
      `Supprimer définitivement "${row.title}" (DB + fichiers Storage) ?`
    );
    if (!ok) return;

    const { error: dbError } = await client.from("videos").delete().eq("id", row.id);
    if (dbError) {
      toast.error(`Suppression DB impossible: ${dbError.message}`);
      return;
    }

    const paths = [row.video_path, row.thumbnail_path].filter(Boolean);
    if (paths.length) {
      const { error: storageError } = await client
        .storage
        .from(SUPABASE_MEDIA_BUCKET)
        .remove(paths);
      if (storageError) {
        toast.error(`DB supprimée, mais fichiers non supprimés: ${storageError.message}`);
        refresh();
        return;
      }
    }

    toast.success("Supprimé.");
    refresh();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-primary-500">
          Bucket: <span className="text-primary-300">{SUPABASE_MEDIA_BUCKET}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-300 px-3 py-2 text-sm hover:bg-gold-500/15 transition-colors"
          >
            + Ajouter une vidéo
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-gold-500/10 bg-navy-950/30 text-primary-300 px-3 py-2 text-sm hover:border-gold-500/25 hover:text-gold-200 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {(creating || editing) && (
        <VideoForm
          mode={creating ? "create" : "edit"}
          initial={editing ?? undefined}
          arColumnsMissing={arColumnsMissing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
          }}
        />
      )}

      {previewing ? (
        <AdminVideoModal
          title={previewing.title}
          description={previewing.description ?? ""}
          videoUrl={getPublicUrl(client, previewing.video_path)}
          posterUrl={getPublicUrl(client, previewing.thumbnail_path)}
          onClose={() => setPreviewing(null)}
          onShare={() => shareVideo(previewing.id)}
        />
      ) : null}

      <div className="rounded-2xl border border-gold-500/10 bg-navy-950/60 backdrop-blur">
        <div className="p-5 border-b border-gold-500/10 flex items-center justify-between">
          <h2 className="text-primary-100 font-medium">Vidéos</h2>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-primary-400 hover:text-gold-300 transition-colors"
          >
            Rafraîchir
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-primary-300">Chargement…</div>
        ) : videos.length === 0 ? (
          <div className="p-5 text-sm text-primary-300">
            Aucune vidéo pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-gold-500/10">
            {videos.map((v) => (
              <li key={v.id} className="p-5 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-56">
                  {v.external_url ? (
                    <a
                      href={v.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full aspect-video rounded-lg overflow-hidden bg-navy-900/50 border border-gold-500/10 relative group block"
                    >
                      <img
                        src={getPublicUrl(client, v.thumbnail_path)}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPreviewing(v)}
                      className="w-full aspect-video rounded-lg overflow-hidden bg-navy-900/50 border border-gold-500/10 relative group"
                      aria-label={`Voir: ${v.title}`}
                    >
                      <img
                        src={getPublicUrl(client, v.thumbnail_path)}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-navy-950 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-primary-100 font-medium truncate">
                          {v.title}
                        </h3>
                        <span
                          className={[
                            "text-[11px] px-2 py-0.5 rounded-full border",
                            v.is_published
                              ? "border-emerald-500/20 text-emerald-300 bg-emerald-500/10"
                              : "border-amber-500/20 text-amber-300 bg-amber-500/10",
                          ].join(" ")}
                        >
                          {v.is_published ? "Publié" : "Brouillon"}
                        </span>
                        {v.external_url && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-300 bg-blue-500/10">
                            Lien externe
                          </span>
                        )}
                      </div>
                      {v.external_url && (
                        <a
                          href={v.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs mt-1 block truncate underline"
                        >
                          {v.external_url}
                        </a>
                      )}
                      {v.description ? (
                        <p className="text-primary-400 text-sm mt-2 line-clamp-2">
                          {v.description}
                        </p>
                      ) : null}
                      <p className="text-primary-600 text-xs mt-2">
                        Ordre: {v.sort_order}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {v.external_url ? (
                        <a
                          href={v.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-2 text-sm hover:bg-blue-500/15 transition-colors"
                        >
                          Voir le lien
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewing(v)}
                          className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors"
                        >
                          Voir
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => shareVideo(v.id)}
                        className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.368-2.684 3 3 0 0 0-5.368 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z" />
                        </svg>
                        Partager
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(v)}
                        className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors"
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        onClick={() => onTogglePublished(v)}
                        className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors"
                      >
                        {v.is_published ? "Dépublier" : "Publier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(v)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 px-3 py-2 text-sm hover:bg-red-500/15 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AdminVideoModal({
  title,
  description,
  videoUrl,
  posterUrl,
  onClose,
  onShare,
}: {
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  onClose: () => void;
  onShare: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [ratio, setRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleMetadata = () => {
    const el = videoRef.current;
    if (el?.videoWidth && el?.videoHeight) {
      setRatio(el.videoWidth / el.videoHeight);
    }
  };

  const isPortrait = ratio !== null && ratio < 1;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full rounded-2xl overflow-hidden border border-gold-500/10 bg-navy-950/95 transition-[max-width] duration-300"
        style={{ maxWidth: isPortrait ? `min(24rem, calc(75vh * ${ratio}))` : "64rem" }}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gold-500/10">
          <div className="min-w-0">
            <div className="text-primary-100 font-medium truncate">{title}</div>
            {description ? (
              <div className="text-primary-400 text-sm truncate">{description}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 text-primary-400 hover:text-gold-400 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.368-2.684 3 3 0 0 0-5.368 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z" />
              </svg>
              Partager
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-primary-400 hover:text-gold-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        <div
          className="bg-black relative"
          style={{ aspectRatio: ratio ? `${ratio}` : "16/9" }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex w-10 h-10 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          ) : null}
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
            poster={posterUrl}
            preload="metadata"
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

function VideoForm({
  mode,
  initial,
  arColumnsMissing,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: VideoRow;
  arColumnsMissing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const client = supabase!;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.description_en ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title_ar ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.description_ar ?? "");
  const [langs, setLangs] = useState<LangFlags>(() => {
    const inferred = inferLangFlags(
      mode === "create",
      initial?.title,
      initial?.title_en,
      arColumnsMissing ? null : initial?.title_ar
    );
    if (arColumnsMissing) inferred.ar = false;
    if (mode === "create" && arColumnsMissing) {
      return { fr: true, en: true, ar: false };
    }
    return inferred;
  });
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
  const [externalUrl, setExternalUrl] = useState(initial?.external_url ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [ogPreviewUrl, setOgPreviewUrl] = useState<string | null>(null);
  const [fetchingOg, setFetchingOg] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<
    "idle" | "thumbnail" | "video" | "db"
  >("idle");

  const isCreate = mode === "create";
  const isExternalLink = Boolean(externalUrl.trim());
  const enabledLangCount = countEnabledLangs(langs);

  useEffect(() => {
    if (!arColumnsMissing) return;
    setLangs((prev) => {
      if (!prev.ar) return prev;
      const next = { ...prev, ar: false };
      if (countEnabledLangs(next) === 0) return { fr: true, en: false, ar: false };
      return next;
    });
  }, [arColumnsMissing]);

  const applyVideoTranslations = (t: {
    titleFr?: string;
    titleEn?: string;
    titleAr?: string;
    descriptionFr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  }) => {
    if (langs.fr) {
      if (t.titleFr) setTitle(t.titleFr);
      if (t.descriptionFr) setDescription(t.descriptionFr);
    }
    if (langs.en) {
      if (t.titleEn) setTitleEn(t.titleEn);
      if (t.descriptionEn) setDescriptionEn(t.descriptionEn);
    }
    if (langs.ar) {
      if (t.titleAr) setTitleAr(t.titleAr);
      if (t.descriptionAr) setDescriptionAr(t.descriptionAr);
    }
  };

  const applyVideoRawText = (ogTitle: string, ogDesc: string) => {
    if (langs.fr) {
      if (ogTitle) setTitle(ogTitle);
      if (ogDesc) setDescription(ogDesc);
    } else if (langs.en) {
      if (ogTitle) setTitleEn(ogTitle);
      if (ogDesc) setDescriptionEn(ogDesc);
    } else if (langs.ar) {
      if (ogTitle) setTitleAr(ogTitle);
      if (ogDesc) setDescriptionAr(ogDesc);
    }
  };

  const fetchOgImage = async () => {
    if (!externalUrl.trim()) {
      toast.error("Entrez d'abord un lien externe.");
      return;
    }
    setFetchingOg(true);
    try {
      const res = await fetch(
        `/api/fetch-og-image?url=${encodeURIComponent(externalUrl.trim())}`
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Erreur ${res.status}`);
      }

      const rawTitle = res.headers.get("X-OG-Title");
      const rawDesc = res.headers.get("X-OG-Description");
      const ogTitle = rawTitle ? decodeURIComponent(rawTitle) : "";
      const ogDesc = rawDesc ? decodeURIComponent(rawDesc) : "";

      const blob = await res.blob();
      const ext = blob.type.includes("png")
        ? "png"
        : blob.type.includes("gif")
          ? "gif"
          : blob.type.includes("webp")
            ? "webp"
            : "jpg";
      const file = new File([blob], `og-image.${ext}`, {
        type: blob.type || "image/jpeg",
      });
      if (ogPreviewUrl) URL.revokeObjectURL(ogPreviewUrl);
      const preview = URL.createObjectURL(blob);
      setThumbFile(file);
      setOgPreviewUrl(preview);

      if (!ogTitle && !ogDesc) {
        toast.success("Image récupérée !");
        return;
      }

      if (enabledLangCount <= 1) {
        applyVideoRawText(ogTitle, ogDesc);
        toast.success("Image et texte récupérés (sans traduction).");
        return;
      }

      try {
        const transRes = await fetch("/api/translate-og", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: ogTitle, description: ogDesc }),
        });
        if (transRes.ok) {
          applyVideoTranslations(await transRes.json());
          toast.success("Image, titre et description récupérés et traduits !");
        } else {
          applyVideoRawText(ogTitle, ogDesc);
          toast.success("Image récupérée (traduction indisponible).");
        }
      } catch {
        applyVideoRawText(ogTitle, ogDesc);
        toast.success("Image récupérée (traduction indisponible).");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de récupérer l'image"
      );
    } finally {
      setFetchingOg(false);
    }
  };

  const translateFromFr = async () => {
    if (enabledLangCount < 2) {
      toast.error("Sélectionnez au moins deux langues pour traduire.");
      return;
    }
    const sourceTitle = langs.fr
      ? title
      : langs.en
        ? titleEn
        : titleAr;
    const sourceDesc = langs.fr
      ? description
      : langs.en
        ? descriptionEn
        : descriptionAr;
    if (!sourceTitle.trim() && !sourceDesc.trim()) {
      toast.error("Renseignez d’abord le titre ou la description.");
      return;
    }
    setTranslating(true);
    try {
      const transRes = await fetch("/api/translate-og", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sourceTitle, description: sourceDesc }),
      });
      if (!transRes.ok) {
        const json = await transRes.json().catch(() => ({}));
        throw new Error(json.error ?? `Erreur ${transRes.status}`);
      }
      applyVideoTranslations(await transRes.json());
      toast.success("Traductions générées pour les langues sélectionnées.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Traduction impossible"
      );
    } finally {
      setTranslating(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enabledLangCount === 0) {
      toast.error("Sélectionnez au moins une langue.");
      return;
    }
    if (langs.fr && !title.trim()) {
      toast.error("Le titre français est requis.");
      return;
    }
    if (langs.en && !titleEn.trim()) {
      toast.error("Le titre anglais est requis.");
      return;
    }
    if (langs.ar && !titleAr.trim()) {
      toast.error("Le titre arabe est requis.");
      return;
    }

    if (isCreate && !isExternalLink && (!videoFile || !thumbFile)) {
      toast.error("Vidéo et photo sont requis pour créer.");
      return;
    }
    if (isCreate && isExternalLink && !thumbFile) {
      toast.error(
        "Cliquez sur « Récupérer l'image » pour obtenir la miniature du lien."
      );
      return;
    }

    setSaving(true);
    setSavingStep("thumbnail");

    const id = initial?.id ?? crypto.randomUUID();
    const nowPrefix = `${Date.now()}`;

    let nextVideoPath = initial?.video_path ?? "";
    let nextThumbPath = initial?.thumbnail_path ?? "";

    const { data: sessionData, error: sessionError } =
      await client.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error("Session expirée. Reconnectez-vous.");
      setSaving(false);
      setSavingStep("idle");
      return;
    }
    const accessToken = sessionData.session.access_token;

    const uploadVideoFile = async (file: File) => {
      const ext = sanitizeFilename(file.name);
      const path = `videos/${id}/${nowPrefix}-${ext}`;
      const { error } = await client.storage.from(SUPABASE_MEDIA_BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      return path;
    };

    try {
      if (thumbFile) {
        setSavingStep("thumbnail");
        const uploadedThumbPath = await uploadMedia(
          "thumbnails",
          id,
          thumbFile,
          accessToken
        );
        if (initial?.thumbnail_path) {
          await client.storage
            .from(SUPABASE_MEDIA_BUCKET)
            .remove([initial.thumbnail_path]);
        }
        nextThumbPath = uploadedThumbPath;
      }

      if (videoFile) {
        setSavingStep("video");
        const uploadedVideoPath = await uploadVideoFile(videoFile);
        if (initial?.video_path) {
          await client.storage.from(SUPABASE_MEDIA_BUCKET).remove([initial.video_path]);
        }
        nextVideoPath = uploadedVideoPath;
      }

      const payload: Record<string, unknown> = {
        title: langs.fr ? title : "",
        description: langs.fr ? description || null : null,
        title_en: langs.en ? titleEn || null : null,
        description_en: langs.en ? descriptionEn || null : null,
        video_path: nextVideoPath,
        thumbnail_path: nextThumbPath,
        external_url: externalUrl.trim() || null,
        is_published: isPublished,
        sort_order: sortOrder,
      };
      if (!arColumnsMissing) {
        payload.title_ar = langs.ar ? titleAr || null : null;
        payload.description_ar = langs.ar ? descriptionAr || null : null;
      }
      if (isCreate) {
        setSavingStep("db");
        const { error } = await client.from("videos").insert({ id, ...payload });
        if (error) throw error;
        toast.success("Vidéo ajoutée.");
      } else {
        setSavingStep("db");
        const { error } = await client
          .from("videos")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast.success("Vidéo mise à jour.");
      }

      onSaved();
    } catch (err) {
      toast.error(formatDbSaveError(err));
    } finally {
      setSaving(false);
      setSavingStep("idle");
    }
  };

  return (
    <div className="relative rounded-2xl border border-gold-500/10 bg-navy-950/60 backdrop-blur p-6 overflow-hidden">
      {saving ? (
        <div className="absolute inset-0 z-10 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-2xl border border-gold-500/15 bg-navy-950/80 px-5 py-4 flex items-center gap-3">
            <span className="inline-flex w-5 h-5 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            <div className="min-w-0">
              <div className="text-primary-100 text-sm font-medium">
                Upload en cours…
              </div>
              <div className="text-primary-400 text-xs">
                {savingStep === "thumbnail"
                  ? "Envoi de la photo"
                  : savingStep === "video"
                    ? "Envoi de la vidéo (peut prendre du temps)"
                    : "Enregistrement en base"}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-primary-100 font-medium">
            {isCreate ? "Ajouter une vidéo" : "Éditer la vidéo"}
          </h3>
          <p className="text-primary-500 text-xs mt-1">
            {isCreate
              ? "Upload: photo + vidéo, puis création en base."
              : "Tu peux modifier les infos et remplacer les fichiers."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-primary-400 hover:text-gold-300 transition-colors text-sm"
        >
          Fermer
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
        <LanguageCheckboxes
          langs={langs}
          onChange={setLangs}
          arDisabled={arColumnsMissing}
        />

        {/* Lien externe — en haut */}
        <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
          <div className="text-xs tracking-wider text-blue-400 uppercase font-medium">
            Lien externe (optionnel)
          </div>
          <p className="text-primary-500 text-xs">
            Si renseigné, les visiteurs seront redirigés vers ce site au clic.
            Aucun fichier vidéo requis — seule la miniature est nécessaire.
          </p>
          <div className="space-y-2">
            <label className="block text-xs tracking-wider text-primary-400 uppercase">
              URL du site externe
            </label>
            <div className="flex gap-2">
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
              />
              <button
                type="button"
                onClick={fetchOgImage}
                disabled={fetchingOg || !externalUrl.trim()}
                className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-2 text-sm hover:bg-blue-500/15 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {fetchingOg ? "Récupération…" : "Récupérer l’image"}
              </button>
            </div>
          </div>
          {ogPreviewUrl && (
            <div className="space-y-1">
              <div className="text-xs text-primary-500">Aperçu de la miniature récupérée :</div>
              <img
                src={ogPreviewUrl}
                alt="Aperçu OG"
                className="w-48 rounded-lg border border-gold-500/10 object-cover"
              />
            </div>
          )}
        </div>

        {enabledLangCount >= 2 && (
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={translateFromFr}
              disabled={translating}
              className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-1.5 text-xs hover:bg-blue-500/15 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {translating ? "Traduction…" : "Traduire vers les langues sélectionnées"}
            </button>
          </div>
        )}

        {/* Section Français */}
        {langs.fr && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              Français
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Titre (FR)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Titre de la vidéo"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Description (FR)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Description (optionnel)"
              />
            </div>
          </div>
        )}

        {/* Section English */}
        {langs.en && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              English
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Title (EN)
              </label>
              <input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Description (EN)
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                className="w-full min-h-[80px] rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Description (optional)"
              />
            </div>
          </div>
        )}

        {/* Section Arabic */}
        {langs.ar && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              العربية
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                العنوان (AR)
              </label>
              <input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                dir="rtl"
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="عنوان الفيديو"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                الوصف (AR)
              </label>
              <textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                dir="rtl"
                className="w-full min-h-[80px] rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="الوصف (اختياري)"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs tracking-wider text-primary-400 uppercase">
            Ordre d’affichage
          </label>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            type="number"
            className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
          />
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-primary-200">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-gold-400"
            />
            Publié
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-xs tracking-wider text-primary-400 uppercase">
            Photo {isCreate ? (isExternalLink ? "(récupérée via le lien)" : "(requis)") : "(optionnel)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setThumbFile(file);
              if (file) {
                if (ogPreviewUrl) URL.revokeObjectURL(ogPreviewUrl);
                setOgPreviewUrl(URL.createObjectURL(file));
              }
            }}
            className="w-full text-primary-200 text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500/10 file:text-gold-200 hover:file:bg-gold-500/15"
          />
        </div>

        {!isExternalLink && (
          <div className="space-y-2">
            <label className="block text-xs tracking-wider text-primary-400 uppercase">
              Vidéo {isCreate ? "(requis)" : "(optionnel)"}
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="w-full text-primary-200 text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500/10 file:text-gold-200 hover:file:bg-gold-500/15"
            />
          </div>
        )}

        <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gold-500/10 bg-navy-950/30 text-primary-300 px-4 py-2 text-sm hover:border-gold-500/25 hover:text-gold-200 transition-colors disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gold-500 text-navy-950 font-medium px-4 py-2 text-sm hover:bg-gold-400 transition-colors disabled:opacity-60"
          >
            {saving ? "Téléversement…" : isCreate ? "Ajouter" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ArticlesDashboard({
  arColumnsMissing,
}: {
  arColumnsMissing: boolean;
}) {
  const client = supabase!;
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [sharingArticleId, setSharingArticleId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await client
      .from("articles")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    setLoading(false);
    if (error) {
      toast.error(`Chargement impossible: ${error.message}`);
      return;
    }
    setArticles((data ?? []) as ArticleRow[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onTogglePublished = async (row: ArticleRow) => {
    const { error } = await client
      .from("articles")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (error) {
      toast.error(`Échec: ${error.message}`);
      return;
    }
    toast.success(row.is_published ? "Dépublié." : "Publié.");
    refresh();
  };

  const onDelete = async (row: ArticleRow) => {
    const ok = window.confirm(
      `Supprimer définitivement "${row.title}" (DB + image Storage) ?`
    );
    if (!ok) return;

    const { error: dbError } = await client.from("articles").delete().eq("id", row.id);
    if (dbError) {
      toast.error(`Suppression DB impossible: ${dbError.message}`);
      return;
    }

    if (row.image_path) {
      const { error: storageError } = await client
        .storage
        .from(SUPABASE_MEDIA_BUCKET)
        .remove([row.image_path]);
      if (storageError) {
        toast.error(`DB supprimée, mais image non supprimée: ${storageError.message}`);
        refresh();
        return;
      }
    }

    toast.success("Supprimé.");
    refresh();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-primary-500">
          Bucket: <span className="text-primary-300">{SUPABASE_MEDIA_BUCKET}</span>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-300 px-3 py-2 text-sm hover:bg-gold-500/15 transition-colors"
        >
          + Ajouter un article
        </button>
      </div>

      {(creating || editing) && (
        <ArticleForm
          mode={creating ? "create" : "edit"}
          initial={editing ?? undefined}
          arColumnsMissing={arColumnsMissing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refresh();
          }}
        />
      )}

      <div className="rounded-2xl border border-gold-500/10 bg-navy-950/60 backdrop-blur">
        <div className="p-5 border-b border-gold-500/10 flex items-center justify-between">
          <h2 className="text-primary-100 font-medium">Articles</h2>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-primary-400 hover:text-gold-300 transition-colors"
          >
            Rafraîchir
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-primary-300">Chargement…</div>
        ) : articles.length === 0 ? (
          <div className="p-5 text-sm text-primary-300">
            Aucun article pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-gold-500/10">
            {articles.map((a) => (
              <li key={a.id} className="p-5 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-56">
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-navy-900/50 border border-gold-500/10">
                    <img
                      src={getPublicUrl(client, a.image_path)}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-primary-100 font-medium truncate">
                          {a.title}
                        </h3>
                        <span
                          className={[
                            "text-[11px] px-2 py-0.5 rounded-full border",
                            a.is_published
                              ? "border-emerald-500/20 text-emerald-300 bg-emerald-500/10"
                              : "border-amber-500/20 text-amber-300 bg-amber-500/10",
                          ].join(" ")}
                        >
                          {a.is_published ? "Publié" : "Brouillon"}
                        </span>
                        {a.external_url && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-blue-500/20 text-blue-300 bg-blue-500/10">
                            Lien externe
                          </span>
                        )}
                      </div>
                      {a.external_url && (
                        <a
                          href={a.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs mt-1 block truncate underline"
                        >
                          {a.external_url}
                        </a>
                      )}
                      {a.content ? (
                        <p className="text-primary-400 text-sm mt-2 line-clamp-3">
                          {htmlToPlainText(a.content)}
                        </p>
                      ) : null}
                      <p className="text-primary-600 text-xs mt-2">
                        Ordre: {a.sort_order}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setSharingArticleId(
                              sharingArticleId === a.id ? null : a.id
                            )
                          }
                          className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-2 text-sm hover:bg-blue-500/15 transition-colors"
                        >
                          Partager
                        </button>
                        {sharingArticleId === a.id && (
                          <AdminSharePopover
                            url={getArticleShareUrl(a)}
                            title={a.title}
                            onClose={() => setSharingArticleId(null)}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
                        className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors"
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        onClick={() => onTogglePublished(a)}
                        className="rounded-lg border border-gold-500/15 bg-navy-950/30 text-primary-200 px-3 py-2 text-sm hover:border-gold-500/30 hover:text-gold-200 transition-colors"
                      >
                        {a.is_published ? "Dépublier" : "Publier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 px-3 py-2 text-sm hover:bg-red-500/15 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ArticleForm({
  mode,
  initial,
  arColumnsMissing,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: ArticleRow;
  arColumnsMissing: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const client = supabase!;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [contentEn, setContentEn] = useState(initial?.content_en ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title_ar ?? "");
  const [contentAr, setContentAr] = useState(initial?.content_ar ?? "");
  const [langs, setLangs] = useState<LangFlags>(() => {
    if (mode === "create" && arColumnsMissing) {
      return { fr: true, en: true, ar: false };
    }
    const inferred = inferLangFlags(
      mode === "create",
      initial?.title,
      initial?.title_en,
      arColumnsMissing ? null : initial?.title_ar
    );
    if (arColumnsMissing) inferred.ar = false;
    return inferred;
  });
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
  const [externalUrl, setExternalUrl] = useState(initial?.external_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ogPreviewUrl, setOgPreviewUrl] = useState<string | null>(null);
  const [fetchingOg, setFetchingOg] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const isCreate = mode === "create";
  const enabledLangCount = countEnabledLangs(langs);

  useEffect(() => {
    if (!arColumnsMissing) return;
    setLangs((prev) => {
      if (!prev.ar) return prev;
      const next = { ...prev, ar: false };
      if (countEnabledLangs(next) === 0) return { fr: true, en: false, ar: false };
      return next;
    });
  }, [arColumnsMissing]);

  const handleTitleEnChange = (value: string) => {
    setTitleEn(value);
    setSlug(slugify(value || title || titleAr));
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!titleEn) setSlug(slugify(value || titleAr));
  };

  const handleTitleArChange = (value: string) => {
    setTitleAr(value);
    if (!titleEn && !title) setSlug(slugify(value));
  };

  const applyArticleTranslations = (t: {
    titleFr?: string;
    titleEn?: string;
    titleAr?: string;
    contentFr?: string;
    contentEn?: string;
    contentAr?: string;
  }) => {
    if (langs.fr) {
      if (t.titleFr) setTitle(t.titleFr);
      if (t.contentFr) setContent(t.contentFr);
    }
    if (langs.en) {
      if (t.titleEn) {
        setTitleEn(t.titleEn);
        setSlug(slugify(t.titleEn));
      }
      if (t.contentEn) setContentEn(t.contentEn);
    }
    if (langs.ar) {
      if (t.titleAr) setTitleAr(t.titleAr);
      if (t.contentAr) setContentAr(t.contentAr);
    }
  };

  const applyArticleRawTitle = (ogTitle: string) => {
    if (langs.fr) {
      setTitle(ogTitle);
      if (!langs.en) setSlug(slugify(ogTitle));
    } else if (langs.en) {
      setTitleEn(ogTitle);
      setSlug(slugify(ogTitle));
    } else if (langs.ar) {
      setTitleAr(ogTitle);
      setSlug(slugify(ogTitle));
    }
  };

  const fetchOgImage = async () => {
    if (!externalUrl.trim()) {
      toast.error("Entrez d'abord un lien externe.");
      return;
    }
    setFetchingOg(true);
    try {
      const res = await fetch(
        `/api/fetch-og-image?url=${encodeURIComponent(externalUrl.trim())}`
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Erreur ${res.status}`);
      }

      const rawTitle = res.headers.get("X-OG-Title");
      const ogTitle = rawTitle ? decodeURIComponent(rawTitle) : "";

      const blob = await res.blob();
      const ext = blob.type.includes("png")
        ? "png"
        : blob.type.includes("gif")
          ? "gif"
          : blob.type.includes("webp")
            ? "webp"
            : "jpg";
      const file = new File([blob], `og-image.${ext}`, {
        type: blob.type || "image/jpeg",
      });
      if (ogPreviewUrl) URL.revokeObjectURL(ogPreviewUrl);
      const preview = URL.createObjectURL(blob);
      setImageFile(file);
      setOgPreviewUrl(preview);

      if (!ogTitle) {
        toast.success("Image récupérée !");
        return;
      }

      if (enabledLangCount <= 1) {
        applyArticleRawTitle(ogTitle);
        toast.success("Image et titre récupérés (sans traduction).");
        return;
      }

      try {
        const transRes = await fetch("/api/translate-og", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: ogTitle, description: "" }),
        });
        if (transRes.ok) {
          applyArticleTranslations(await transRes.json());
          toast.success("Image et titre récupérés et traduits !");
        } else {
          applyArticleRawTitle(ogTitle);
          toast.success("Image récupérée (traduction indisponible).");
        }
      } catch {
        applyArticleRawTitle(ogTitle);
        toast.success("Image récupérée (traduction indisponible).");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de récupérer l'image"
      );
    } finally {
      setFetchingOg(false);
    }
  };

  const translateSelectedLangs = async () => {
    if (enabledLangCount < 2) {
      toast.error("Sélectionnez au moins deux langues pour traduire.");
      return;
    }
    const hasExternal = Boolean(externalUrl.trim());
    const sourceTitle = langs.fr
      ? title
      : langs.en
        ? titleEn
        : titleAr;
    const sourceContent = hasExternal
      ? ""
      : langs.fr
        ? content
        : langs.en
          ? contentEn
          : contentAr;
    if (!sourceTitle.trim() && !sourceContent.trim()) {
      toast.error("Renseignez d’abord le titre (et le contenu si article interne).");
      return;
    }
    setTranslating(true);
    try {
      const transRes = await fetch("/api/translate-og", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sourceTitle,
          description: "",
          content: sourceContent,
        }),
      });
      if (!transRes.ok) {
        const json = await transRes.json().catch(() => ({}));
        throw new Error(json.error ?? `Erreur ${transRes.status}`);
      }
      applyArticleTranslations(await transRes.json());
      toast.success("Traductions générées pour les langues sélectionnées.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Traduction impossible"
      );
    } finally {
      setTranslating(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enabledLangCount === 0) {
      toast.error("Sélectionnez au moins une langue.");
      return;
    }
    if (langs.fr && !title.trim()) {
      toast.error("Le titre français est requis.");
      return;
    }
    if (langs.en && !titleEn.trim()) {
      toast.error("Le titre anglais est requis.");
      return;
    }
    if (langs.ar && !titleAr.trim()) {
      toast.error("Le titre arabe est requis.");
      return;
    }

    const hasExternal = Boolean(externalUrl.trim());
    if (!hasExternal) {
      if (langs.fr && !content.trim()) {
        toast.error("Le contenu français est requis.");
        return;
      }
      if (langs.en && !contentEn.trim()) {
        toast.error("Le contenu anglais est requis.");
        return;
      }
      if (langs.ar && !contentAr.trim()) {
        toast.error("Le contenu arabe est requis.");
        return;
      }
    }

    const sourceTitle =
      (langs.en && titleEn.trim()) ||
      (langs.fr && title.trim()) ||
      (langs.ar && titleAr.trim()) ||
      "";
    const baseSlug = slug.trim() || slugify(sourceTitle);
    if (!baseSlug) {
      toast.error("Veuillez renseigner au moins le titre pour générer l'URL.");
      return;
    }

    if (isCreate && !imageFile) {
      toast.error(
        externalUrl.trim()
          ? "Cliquez sur « Récupérer l'image » pour obtenir l'image du lien externe."
          : "L'image est requise pour créer."
      );
      return;
    }

    setSaving(true);
    const id = initial?.id ?? crypto.randomUUID();
    let nextImagePath = initial?.image_path ?? "";

    try {
      const finalSlug = await buildUniqueArticleSlug(
        client,
        baseSlug,
        isCreate ? undefined : id
      );
      if (finalSlug !== slug) setSlug(finalSlug);

      if (imageFile) {
        const { data: sessionData, error: sessionError } =
          await client.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error("Session expirée. Reconnectez-vous.");
        }

        const path = await uploadMedia(
          "articles",
          id,
          imageFile,
          sessionData.session.access_token
        );

        if (initial?.image_path) {
          await client.storage.from(SUPABASE_MEDIA_BUCKET).remove([initial.image_path]);
        }
        nextImagePath = path;
      }

      const payload: Record<string, unknown> = {
        title: langs.fr ? title : "",
        content: langs.fr ? content : "",
        title_en: langs.en ? titleEn || null : null,
        content_en: langs.en ? contentEn || null : null,
        slug: finalSlug,
        image_path: nextImagePath,
        external_url: externalUrl.trim() || null,
        is_published: isPublished,
        sort_order: sortOrder,
      };
      if (!arColumnsMissing) {
        payload.title_ar = langs.ar ? titleAr || null : null;
        payload.content_ar = langs.ar ? contentAr || null : null;
      }

      if (isCreate) {
        const { error } = await client.from("articles").insert({ id, ...payload });
        if (error) throw error;
        toast.success("Article ajouté.");
      } else {
        const { error } = await client
          .from("articles")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast.success("Article mis à jour.");
      }

      onSaved();
    } catch (err) {
      toast.error(formatDbSaveError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-gold-500/10 bg-navy-950/60 backdrop-blur p-6 overflow-hidden">
      {saving ? (
        <div className="absolute inset-0 z-10 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-2xl border border-gold-500/15 bg-navy-950/80 px-5 py-4 flex items-center gap-3">
            <span className="inline-flex w-5 h-5 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            <div className="text-primary-100 text-sm font-medium">Enregistrement…</div>
          </div>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-primary-100 font-medium">
            {isCreate ? "Ajouter un article" : "Éditer l'article"}
          </h3>
          <p className="text-primary-500 text-xs mt-1">
            {isCreate
              ? "Upload de l'image puis création en base."
              : "Tu peux modifier les champs et remplacer l'image."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-primary-400 hover:text-gold-300 transition-colors text-sm"
        >
          Fermer
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
        <LanguageCheckboxes
          langs={langs}
          onChange={setLangs}
          arDisabled={arColumnsMissing}
        />

        {/* Lien externe — en haut */}
        <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
          <div className="text-xs tracking-wider text-blue-400 uppercase font-medium">
            Lien externe (optionnel)
          </div>
          <p className="text-primary-500 text-xs">
            Si renseigné, les visiteurs seront redirigés vers ce site au clic.
            Le contenu de l&apos;article est sur le site externe — inutile de le saisir ici.
          </p>
          <div className="space-y-2">
            <label className="block text-xs tracking-wider text-primary-400 uppercase">
              URL du site externe
            </label>
            <div className="flex gap-2">
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                type="url"
                placeholder="https://exemple.com/article"
                className="flex-1 rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
              />
              <button
                type="button"
                onClick={fetchOgImage}
                disabled={fetchingOg || !externalUrl.trim()}
                className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-2 text-sm hover:bg-blue-500/15 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {fetchingOg ? "Récupération…" : "Récupérer l’image"}
              </button>
            </div>
          </div>
          {ogPreviewUrl && (
            <div className="space-y-1">
              <div className="text-xs text-primary-500">Aperçu de l&apos;image récupérée :</div>
              <img
                src={ogPreviewUrl}
                alt="Aperçu OG"
                className="w-48 rounded-lg border border-gold-500/10 object-cover"
              />
            </div>
          )}
        </div>

        {enabledLangCount >= 2 && (
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={translateSelectedLangs}
              disabled={translating}
              className="rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-200 px-3 py-1.5 text-xs hover:bg-blue-500/15 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {translating ? "Traduction…" : "Traduire vers les langues sélectionnées"}
            </button>
          </div>
        )}

        {/* Section Français */}
        {langs.fr && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              Français
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Titre (FR)
              </label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Titre de l’article"
              />
            </div>
            {!externalUrl.trim() && (
              <div className="space-y-2">
                <label className="block text-xs tracking-wider text-primary-400 uppercase">
                  Contenu (FR)
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Rédigez le contenu de l’article en français…"
                />
              </div>
            )}
          </div>
        )}

        {langs.en && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              English
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                Title (EN)
              </label>
              <input
                value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="Article title"
              />
            </div>
            {!externalUrl.trim() && (
              <div className="space-y-2">
                <label className="block text-xs tracking-wider text-primary-400 uppercase">
                  Content (EN)
                </label>
                <RichTextEditor
                  value={contentEn}
                  onChange={setContentEn}
                  placeholder="Write the article content in English…"
                />
              </div>
            )}
          </div>
        )}

        {langs.ar && (
          <div className="md:col-span-2 space-y-3 pt-2 border-b border-gold-500/10 pb-4">
            <div className="text-xs tracking-wider text-gold-400 uppercase font-medium">
              العربية
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-wider text-primary-400 uppercase">
                العنوان (AR)
              </label>
              <input
                value={titleAr}
                onChange={(e) => handleTitleArChange(e.target.value)}
                dir="rtl"
                className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
                placeholder="عنوان المقال"
              />
            </div>
            {!externalUrl.trim() && (
              <div className="space-y-2">
                <label className="block text-xs tracking-wider text-primary-400 uppercase">
                  المحتوى (AR)
                </label>
                <RichTextEditor
                  value={contentAr}
                  onChange={setContentAr}
                  dir="rtl"
                  placeholder="اكتب محتوى المقال بالعربية…"
                />
              </div>
            )}
          </div>
        )}

        {/* Slug auto-généré — caché de l'interface */}
        <input type="hidden" value={slug} readOnly />

        <div className="space-y-2">
          <label className="block text-xs tracking-wider text-primary-400 uppercase">
            Ordre d’affichage
          </label>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            type="number"
            className="w-full rounded-lg bg-navy-900/50 border border-gold-500/10 focus:border-gold-500/40 outline-none px-3 py-2 text-primary-100"
          />
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-primary-200">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-gold-400"
            />
            Publié
          </label>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs tracking-wider text-primary-400 uppercase">
            Image {isCreate ? "(requise — ou récupérée via le lien)" : "(optionnelle)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              if (file) {
                if (ogPreviewUrl) URL.revokeObjectURL(ogPreviewUrl);
                setOgPreviewUrl(URL.createObjectURL(file));
              }
            }}
            className="w-full text-primary-200 text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gold-500/10 file:text-gold-200 hover:file:bg-gold-500/15"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gold-500/10 bg-navy-950/30 text-primary-300 px-4 py-2 text-sm hover:border-gold-500/25 hover:text-gold-200 transition-colors disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gold-500 text-navy-950 font-medium px-4 py-2 text-sm hover:bg-gold-400 transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : isCreate ? "Ajouter" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

