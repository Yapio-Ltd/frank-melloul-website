"use client";

import { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

// Pre-computed particle positions for performance (reduced from 20 to 8)
const PARTICLES = [
  { left: 15, top: 20, duration: 6, delay: 0 },
  { left: 45, top: 35, duration: 7, delay: 1 },
  { left: 75, top: 15, duration: 8, delay: 2 },
  { left: 25, top: 70, duration: 6.5, delay: 1.5 },
  { left: 85, top: 55, duration: 7.5, delay: 0.5 },
  { left: 55, top: 80, duration: 6, delay: 2.5 },
  { left: 10, top: 50, duration: 8, delay: 3 },
  { left: 65, top: 45, duration: 7, delay: 1.8 },
];

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />

      {/* Animated background particles - optimized with fixed positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-500/20 rounded-full will-change-transform"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

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
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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

      {/* Decorative elements - CSS animations for better performance */}
      <div
        className="absolute top-1/4 right-10 w-72 h-72 rounded-full animate-pulse-slow pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201, 162, 19, 0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full animate-pulse-slower pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201, 162, 19, 0.03) 0%, transparent 70%)",
        }}
      />
    </section>
  );
}

export default memo(HeroSection);
