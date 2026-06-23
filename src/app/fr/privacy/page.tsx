import type { Metadata } from "next";
import PrivacyPageClient from "@/app/privacy/PrivacyPageClient";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/fr/privacy" },
};

export default function PrivacyFrPage() {
  return <PrivacyPageClient />;
}
