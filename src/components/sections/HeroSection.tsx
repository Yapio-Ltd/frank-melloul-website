"use client";

import { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import HeroUnicornBackground from "./HeroUnicornBackground";

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-20"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/50 to-navy-950/80" />
      <HeroUnicornBackground />
      <div className="absolute inset-0 z-[1] bg-navy-950/30 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10 flex items-center justify-center min-h-[60vh]"
        style={{ y, opacity }}
      >
        <div className="text-center">
          {/* Company name with special styling - centered */}
          <motion.div
            className="mb-4 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <h1 className="flex flex-col items-center gap-2 text-center font-sans font-medium">
              <span className="text-gold-400 text-2xl md:text-3xl lg:text-4xl tracking-[0.15em]">
                {t.hero.companyName}
              </span>
              <span className="text-primary-300 text-xs md:text-sm tracking-[0.35em] uppercase font-normal">
                {t.hero.globalAdvisory}
              </span>
            </h1>
          </motion.div>

          {/* Tagline - Strategy for Influence and Diplomacy */}
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-serif font-light tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <span className="text-primary-100">{t.hero.taglinePart1}</span>
            <span className="text-gold-400">{t.hero.taglineHighlight1}</span>
            <span className="text-primary-100">{t.hero.taglinePart2}</span>
            <span className="text-gold-400">{t.hero.taglineHighlight2}</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll indicator - positioned at bottom of section */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={prefersReducedMotion ? undefined : { y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary-400 text-xs tracking-widest uppercase">
            {t.hero.discover}
          </span>
          <svg
            className="w-6 h-6 text-gold-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div
        className={`absolute top-1/4 right-10 w-72 h-72 rounded-full pointer-events-none z-[1]${prefersReducedMotion ? "" : " animate-pulse-slow"}`}
        style={{
          background:
            "radial-gradient(circle, rgba(201, 162, 19, 0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className={`absolute bottom-1/4 left-10 w-96 h-96 rounded-full pointer-events-none z-[1]${prefersReducedMotion ? "" : " animate-pulse-slower"}`}
        style={{
          background:
            "radial-gradient(circle, rgba(201, 162, 19, 0.03) 0%, transparent 70%)",
        }}
      />
    </section>
  );
}

export default memo(HeroSection);
