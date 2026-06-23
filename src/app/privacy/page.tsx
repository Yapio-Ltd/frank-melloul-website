import type { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";
import { LANGUAGE_ALTERNATES } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Melloul & Partners. Learn how we collect, use, and protect your personal data.",
  alternates: {
    canonical: "/privacy",
    languages: {
      ...LANGUAGE_ALTERNATES,
      en: "/privacy",
      fr: "/fr/privacy",
      ar: "/ar/privacy",
    },
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
