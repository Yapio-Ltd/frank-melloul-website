"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function BiographySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { t } = useLanguage();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      id="biography"
      ref={sectionRef}
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-navy-950" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section title */}
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="w-6 h-[1px] bg-gold-400" />
          <h2 className="text-lg md:text-xl font-sans font-medium text-primary-200 tracking-wide">
            {t.biography.title}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Image */}
          <motion.div
            ref={imageRef}
            className="lg:col-span-2 relative"
            style={{ y: imageY }}
          >
            <motion.div
              className="relative aspect-[3/4] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* Frank Melloul Photo */}
              <img
                src="/frank_melloul_avatar.webp"
                alt="Frank Melloul - Founder of Melloul & Partners"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />

              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />

              {/* Image reveal effect */}
              <motion.div
                className="absolute inset-0 bg-navy-950"
                initial={{ scaleX: 1 }}
                animate={isInView ? { scaleX: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
                style={{ transformOrigin: "right" }}
              />
            </motion.div>

            {/* Decorative frame */}
            <motion.div
              className="absolute -bottom-4 -right-4 w-full h-full border border-gold-500/20 -z-10"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </motion.div>

          {/* Biography text */}
          <div className="lg:col-span-3 space-y-5">
            {t.biography.paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                className={`leading-relaxed text-sm md:text-base ${
                  index === 0
                    ? "text-base md:text-lg text-primary-100/90"
                    : "text-primary-400"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                {paragraph}
              </motion.p>
            ))}

            {/* Highlights */}
            <motion.div
              className="mt-12 pt-8 border-t border-gold-500/10"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex flex-wrap gap-6">
                {t.biography.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex-1 min-w-[120px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  >
                    <span className="text-2xl md:text-3xl font-serif text-gold-400 block mb-1">
                      {stat.value}
                    </span>
                    <span className="text-primary-500 text-xs">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
