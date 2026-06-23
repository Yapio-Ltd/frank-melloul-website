import type { Metadata } from "next";
import { LANGUAGE_ALTERNATES } from "@/lib/locale";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import AboutSection from "@/components/sections/AboutSection";
import BiographySection from "@/components/sections/BiographySection";
import ContactSection from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Frank Melloul | Melloul & Partners — Conseil stratégique international",
  description:
    "Frank Melloul est le fondateur de Melloul & Partners, cabinet de conseil stratégique international. Influence, diplomatie et accompagnement des dirigeants.",
  keywords: [
    "Frank Melloul",
    "Frank Melloul conseiller",
    "Melloul & Partners",
    "conseil stratégique",
    "diplomatie",
    "influence",
    "affaires publiques",
    "consulting international",
    "géopolitique",
    "conseil en influence",
  ],
  alternates: {
    canonical: "/fr",
    languages: LANGUAGE_ALTERNATES,
  },
  openGraph: {
    title: "Frank Melloul | Melloul & Partners — Conseil stratégique international",
    description:
      "Frank Melloul dirige Melloul & Partners : conseil stratégique, influence et diplomatie pour les décideurs.",
    url: "https://melloulandpartners.com/fr",
    locale: "fr_FR",
    type: "website",
    siteName: "Melloul & Partners",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frank Melloul | Melloul & Partners — Conseil stratégique",
    description:
      "Frank Melloul dirige Melloul & Partners : conseil stratégique, influence et diplomatie pour les décideurs.",
    creator: "@frankmelloul",
  },
};

const frPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://melloulandpartners.com/fr#webpage",
  url: "https://melloulandpartners.com/fr",
  name: "Frank Melloul | Melloul & Partners — Conseil stratégique international",
  description:
    "Frank Melloul est le fondateur de Melloul & Partners, cabinet de conseil stratégique international. Influence, diplomatie et accompagnement des dirigeants.",
  inLanguage: "fr",
  isPartOf: { "@id": "https://melloulandpartners.com/#website" },
  about: { "@id": "https://melloulandpartners.com/#frank-melloul" },
};

export default function HomeFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(frPageSchema) }}
      />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <BiographySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

