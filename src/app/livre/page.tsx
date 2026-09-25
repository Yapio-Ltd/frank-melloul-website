import type { Metadata } from "next";
import Image from "next/image";
import { BOOK_RETAILERS, bookLinkPath, type BookRetailer, type BookSearchParams } from "@/lib/book-links";
import styles from "./book.module.css";

export const metadata: Metadata = {
  title: { absolute: "La bascule — Le livre de Frank Melloul" },
  alternates: { canonical: "/livre" },
  robots: { index: true, follow: true },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function RetailerLinks({ searchParams, preorder }: { searchParams: BookSearchParams; preorder: boolean }) {
  return (
    <div className={styles.retailers}>
      {(["fnac", "amazon"] as BookRetailer[]).map((retailer) => (
        <a key={retailer} href={bookLinkPath(retailer, searchParams)} className={styles.retailer} aria-label={`${preorder ? "Précommander" : "Commander"} La bascule sur ${BOOK_RETAILERS[retailer].label}`}>
          <span className={styles.retailerLogo}>
            <Image src={`/book/${retailer}.svg`} alt={BOOK_RETAILERS[retailer].label} width={retailer === "amazon" ? 105 : 49} height={retailer === "amazon" ? 36 : 51} unoptimized />
          </span>
          <span>{preorder ? "Précommander" : "Commander"}</span><Arrow diagonal />
        </a>
      ))}
    </div>
  );
}

export default function BookPage({ searchParams }: { searchParams: BookSearchParams }) {
  const preorder = Date.now() < Date.parse("2026-10-01T00:00:00+02:00");
  const bookSchema = {
    "@context": "https://schema.org", "@type": "Book", name: "La bascule",
    alternativeHeadline: "Les coulisses du nouveau Moyen-Orient",
    author: { "@type": "Person", name: "Frank Melloul", url: "https://melloulandpartners.com/fr" },
    publisher: { "@type": "Organization", name: "Éditions de l’Observatoire" },
    isbn: "9791032937815", datePublished: "2026-10-01", inLanguage: "fr",
    bookFormat: "https://schema.org/Paperback", url: "https://melloulandpartners.com/livre",
    image: "https://melloulandpartners.com/book/la-bascule-cover.jpg",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema).replace(/</g, "\\u003c") }} />
      <section className={styles.hero} aria-labelledby="book-title">
        <div className={styles.heroIntro}>
          <h1 id="book-title">La bascule<span>.</span></h1>
          <p className={styles.subtitle}>Les coulisses du<br className={styles.desktopBreak} /> nouveau Moyen-Orient</p>
          <p className={styles.byline}>Un livre de <a href="#auteur">Frank Melloul</a></p>
        </div>
        <figure className={styles.coverStage}>
          <div className={styles.coverMount}>
            <Image className={styles.cover} src="/book/la-bascule-cover.jpg" alt="La bascule, de Frank Melloul — couverture de l’édition brochée aux Éditions de l’Observatoire" width={316} height={500} priority unoptimized />
          </div>
          <figcaption>Éditions de l’Observatoire</figcaption>
        </figure>
        <div className={styles.heroSummary}>
          <p>Des accords d’Abraham aux bouleversements du 7 octobre, un regard depuis Tel-Aviv sur les alliances et les tensions qui redessinent la région.</p>
          <a href="#presentation" className={styles.readMore}>Découvrir le livre <Arrow /></a>
        </div>
        <div className={styles.purchase} id="commander">
          <p className={styles.release}>{preorder ? "En précommande" : "Paru"}<span aria-hidden="true"> · </span><span>{preorder ? "Parution le " : "Le "}<time dateTime="2026-10-01">1er octobre 2026</time></span></p>
          <RetailerLinks searchParams={searchParams} preorder={preorder} />
          <p className={styles.purchaseNote}>Édition brochée en français. Prix et livraison chez votre libraire.</p>
        </div>
      </section>
      <section id="presentation" className={styles.presentation} aria-labelledby="presentation-title">
        <div className={styles.synopsis}>
          <h2 id="presentation-title">Un regard de l’intérieur<br />sur une région qui bascule.</h2>
          <p className={styles.lead}>Depuis Tel-Aviv, Frank Melloul raconte les transformations d’une région dont il observe de près les équilibres politiques et diplomatiques.</p>
          <p>Son récit suit trois moments : la préparation et le développement des accords d’Abraham, le choc du 7 octobre et ses conséquences, puis la recherche d’un nouvel ordre régional. Des capitales du Golfe aux lieux de décision occidentaux, il éclaire les négociations, les rapprochements et les tensions qui redessinent le Moyen-Orient.</p>
          <p>Au fil de ces rencontres, il défend une idée : les crises récentes rendent nécessaire un cadre de coopération plus large entre les États de la région. Une lecture des événements à travers leurs coulisses diplomatiques.</p>
        </div>
        <aside className={styles.details} aria-labelledby="details-title">
          <h3 id="details-title">Le livre en détail</h3>
          <dl>
            <div><dt>Auteur</dt><dd>Frank Melloul</dd></div>
            <div><dt>Éditeur</dt><dd>Éditions de l’Observatoire</dd></div>
            <div><dt>Parution</dt><dd><time dateTime="2026-10-01">1er octobre 2026</time></dd></div>
            <div><dt>Format</dt><dd>Broché</dd></div>
            <div><dt>Langue</dt><dd>Français</dd></div>
            <div><dt>ISBN</dt><dd>9791032937815</dd></div>
          </dl>
          <a href="https://editions-observatoire.com/livre/La-bascule/679" target="_blank" rel="noopener noreferrer" className={styles.readMore}>Voir la fiche de l’éditeur <Arrow diagonal /></a>
        </aside>
      </section>
      <section id="auteur" className={styles.author} aria-labelledby="author-title">
        <div className={styles.authorPortrait}>
          <Image src="/frank_melloul_avatar.webp" alt="Portrait de Frank Melloul" width={1200} height={1405} sizes="(max-width: 700px) 85vw, 360px" unoptimized />
        </div>
        <div className={styles.authorText}>
          <h2 id="author-title">Frank Melloul</h2>
          <p className={styles.authorRole}>Entre diplomatie et médias internationaux.</p>
          <p>Fondateur de Melloul &amp; Partners, Frank Melloul a consacré son parcours à la diplomatie, à l’influence et aux médias. Après avoir contribué au développement de France 24, il crée i24NEWS en 2013.</p>
          <p>Avec <em>La bascule</em>, il propose sa lecture des transformations politiques et diplomatiques du Moyen-Orient.</p>
          <a href="/fr#biography" className={styles.readMore}>Découvrir son parcours <Arrow /></a>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title">
        <div><h2 id="closing-title">Poursuivre la lecture.</h2><p>Retrouvez <em>La bascule</em> chez votre libraire.</p></div>
        <RetailerLinks searchParams={searchParams} preorder={preorder} />
      </section>
    </>
  );
}
