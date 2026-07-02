"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201, 162, 19, 0.05) 0%, transparent 70%)",
        }}
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary-100/90 mb-6">
              {t.contact.title.split(" ").map((word, index, arr) => (
                <span key={index}>
                  {index === arr.length - 1 ? (
                    <span className="text-gold-400">{word}</span>
                  ) : (
                    word
                  )}{" "}
                </span>
              ))}
            </h2>
          </motion.div>

          <motion.p
            className="text-primary-400 text-base md:text-lg mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.contact.subtitle}
          </motion.p>

          {/* Contact button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="mailto:contact@melloulandpartners.com"
              data-mailto-location="contact_section"
            >
              <motion.button
                className="btn-primary text-lg px-12 py-5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.contact.button}
                <motion.span
                  className="inline-block ml-2"
                  animate={prefersReducedMotion ? undefined : { x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: prefersReducedMotion ? 0 : Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Contact info */}
          <motion.div
            className="mt-12 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <span className="text-gold-400 text-xs tracking-widest uppercase block mb-2">
                {t.contact.email}
              </span>
              <span className="text-primary-300 text-sm">contact@melloulandpartners.com</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
