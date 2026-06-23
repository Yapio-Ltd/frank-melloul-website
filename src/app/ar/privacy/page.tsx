import type { Metadata } from "next";
import PrivacyPageClient from "@/app/privacy/PrivacyPageClient";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  alternates: { canonical: "/ar/privacy" },
};

export default function PrivacyArPage() {
  return <PrivacyPageClient />;
}
