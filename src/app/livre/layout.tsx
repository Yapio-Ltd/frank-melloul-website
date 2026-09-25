import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La bascule — Frank Melloul",
  description: "Retrouvez La bascule, le livre de Frank Melloul, chez votre libraire en ligne.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "La bascule — Frank Melloul",
    description: "Choisissez votre libraire pour découvrir le livre de Frank Melloul.",
    locale: "fr_FR",
    type: "website",
    url: "/livre",
  },
  twitter: {
    card: "summary",
    title: "La bascule — Frank Melloul",
    description: "Retrouvez le livre de Frank Melloul chez votre libraire en ligne.",
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <main lang="fr" dir="ltr" className="min-h-screen bg-navy-950 px-6 pb-80 pt-16 text-primary-50 sm:pt-24 md:pb-56">
      <div className="mx-auto max-w-xl">
        <a href="/fr" className="text-xs uppercase tracking-[0.2em] text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300">
          Melloul &amp; Partners
        </a>
        <div className="mt-16 border-t border-gold-500/30 pt-8 sm:mt-20">
          <p className="text-sm text-primary-300">Frank Melloul</p>
          <h1 className="mt-3 font-serif text-6xl font-light sm:text-7xl">La bascule</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
