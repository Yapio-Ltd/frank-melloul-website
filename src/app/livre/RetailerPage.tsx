import { bookLinkPath, type BookRetailer, type BookSearchParams } from "@/lib/book-links";
import BookRedirect from "./BookRedirect";
import styles from "./book.module.css";

export default function RetailerPage({ retailer, searchParams }: { retailer: BookRetailer; searchParams: BookSearchParams }) {
  return (
    <div className={styles.redirect}>
      <p className={styles.redirectAuthor}>Frank Melloul</p>
      <h1>La bascule</h1>
      <BookRedirect key={retailer} retailer={retailer} />
      <p className="mt-8 text-sm">
        <a href={bookLinkPath(undefined, searchParams)} className="text-primary-300 underline underline-offset-4 hover:text-primary-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300">
          Choisir un autre libraire
        </a>
      </p>
    </div>
  );
}
