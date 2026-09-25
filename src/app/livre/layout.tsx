import type { Metadata } from "next";
import styles from "./book.module.css";

export const metadata: Metadata = {
  title: "La bascule — Frank Melloul",
  description: "Découvrez La bascule, Les coulisses du nouveau Moyen-Orient, de Frank Melloul. Éditions de l’Observatoire. Parution le 1er octobre 2026.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "La bascule — Frank Melloul",
    description: "Les coulisses du nouveau Moyen-Orient. Découvrez le livre et retrouvez-le chez votre libraire.",
    locale: "fr_FR", type: "website", url: "/livre",
    images: [{ url: "/book/la-bascule-cover.jpg", width: 316, height: 500, alt: "Couverture de La bascule, de Frank Melloul" }],
  },
  twitter: {
    card: "summary_large_image", title: "La bascule — Frank Melloul",
    description: "Les coulisses du nouveau Moyen-Orient. Éditions de l’Observatoire.",
    images: ["/book/la-bascule-cover.jpg"],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="fr" dir="ltr" className={styles.bookSite}>
      <a href="#livre-contenu" className={styles.skipLink}>Aller au contenu</a>
      <header className={styles.header}>
        <a href="/fr" className={styles.brand}>Melloul <span>&amp;</span> Partners</a>
        <a href="/fr" className={styles.siteLink}>Le site de Frank Melloul<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
      </header>
      <main id="livre-contenu">{children}</main>
      <footer className={styles.footer}>
        <a href="/fr" className={styles.footerBrand}>Melloul &amp; Partners</a>
        <p>Diplomatie, influence et stratégie.</p>
        <a href="/fr/privacy">Confidentialité</a>
      </footer>
    </div>
  );
}
