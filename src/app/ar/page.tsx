import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import AboutSection from "@/components/sections/AboutSection";
import BiographySection from "@/components/sections/BiographySection";
import ContactSection from "@/components/sections/ContactSection";
import { LANGUAGE_ALTERNATES } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Frank Melloul | Melloul & Partners — استشارات استراتيجية عالمية",
  description:
    "Frank Melloul هو مؤسس Melloul & Partners، شركة استشارات استراتيجية عالمية. التأثير والدبلوماسية ومرافقة القادة.",
  alternates: {
    canonical: "/ar",
    languages: LANGUAGE_ALTERNATES,
  },
  openGraph: {
    title: "Frank Melloul | Melloul & Partners — استشارات استراتيجية عالمية",
    description:
      "Frank Melloul يقود Melloul & Partners: استشارات استراتيجية وتأثير ودبلوماسية لصناع القرار.",
    url: "https://melloulandpartners.com/ar",
    locale: "ar_AE",
    type: "website",
    siteName: "Melloul & Partners",
  },
};

const arPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://melloulandpartners.com/ar#webpage",
  url: "https://melloulandpartners.com/ar",
  name: "Frank Melloul | Melloul & Partners — استشارات استراتيجية عالمية",
  description:
    "Frank Melloul هو مؤسس Melloul & Partners، شركة استشارات استراتيجية عالمية. التأثير والدبلوماسية ومرافقة القادة.",
  inLanguage: "ar",
  isPartOf: { "@id": "https://melloulandpartners.com/#website" },
  about: { "@id": "https://melloulandpartners.com/#frank-melloul" },
};

export default function HomeAr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(arPageSchema) }}
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
