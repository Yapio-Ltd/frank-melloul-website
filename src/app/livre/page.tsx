import type { Metadata } from "next";
import { BOOK_RETAILERS, bookLinkPath, type BookRetailer, type BookSearchParams } from "@/lib/book-links";

export const metadata: Metadata = {
  alternates: { canonical: "/livre" },
};

export default function BookPage({ searchParams }: { searchParams: BookSearchParams }) {
  return (
    <>
      <p className="mt-6 text-base leading-relaxed text-primary-200">Choisissez votre libraire pour découvrir et commander le livre.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {(Object.keys(BOOK_RETAILERS) as BookRetailer[]).map((retailer) => (
          <a
            key={retailer}
            href={bookLinkPath(retailer, searchParams)}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-gold-400/40 bg-gold-500/15 px-6 py-3 font-medium text-gold-200 transition-colors hover:bg-gold-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
          >
            Acheter sur {BOOK_RETAILERS[retailer].name}
          </a>
        ))}
      </div>
    </>
  );
}
