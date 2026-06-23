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
  alternates: {
    canonical: "/",
    languages: LANGUAGE_ALTERNATES,
  },
};

export default function Home() {
  return (
    <>
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

