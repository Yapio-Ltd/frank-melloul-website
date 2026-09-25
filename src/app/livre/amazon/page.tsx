import type { Metadata } from "next";
import type { BookSearchParams } from "@/lib/book-links";
import RetailerPage from "../RetailerPage";

export const metadata: Metadata = {
  title: "La bascule — Acheter sur Amazon",
  alternates: { canonical: "/livre/amazon" },
};

export default function AmazonBookPage({ searchParams }: { searchParams: BookSearchParams }) {
  return <RetailerPage retailer="amazon" searchParams={searchParams} />;
}
