import type { Metadata } from "next";
import type { BookSearchParams } from "@/lib/book-links";
import RetailerPage from "../RetailerPage";

export const metadata: Metadata = {
  title: "La bascule — Acheter sur la Fnac",
  alternates: { canonical: "/livre/fnac" },
};

export default function FnacBookPage({ searchParams }: { searchParams: BookSearchParams }) {
  return <RetailerPage retailer="fnac" searchParams={searchParams} />;
}
