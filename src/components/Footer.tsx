"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { buildLocalizedPath } from "@/lib/locale";

export default function Footer() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  const handleSecretAdminClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
      clickTimerRef.current = null;
    }, 1200);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      router.push("/admin");
    }
  };

  return (
    <footer className="relative z-10 bg-navy-950 border-t border-gold-500/10">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <img
              src="/only_gold_logo.png"
              alt="Melloul & Partners"
              width={180}
              height={180}
              style={{ objectFit: "contain" }}
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Link
              href="mailto:contact@melloulandpartners.com"
              className="text-primary-300 hover:text-gold-500 text-sm transition-colors duration-300 animated-underline"
            >
              contact@melloulandpartners.com
            </Link>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/company/melloul-partners-global-advisory/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="LinkedIn"
            >
              <motion.div
                className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </motion.div>
            </Link>

            {/* Facebook */}
            <Link
              href="https://www.facebook.com/share/1Gs4mWEmU3/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Facebook"
            >
              <motion.div
                className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.414c0-3.035 1.792-4.714 4.533-4.714 1.312 0 2.686.236 2.686.236v2.977h-1.513c-1.49 0-1.953.93-1.953 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
                </svg>
              </motion.div>
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/frankmelloul/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Instagram"
            >
              <motion.div
                className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm9.9 2.4a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                </svg>
              </motion.div>
            </Link>

            {/* X (Twitter) */}
            <Link
              href="https://x.com/frankmelloul"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="X (Twitter)"
            >
              <motion.div
                className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.div>
            </Link>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            viewport={{ once: true }}
          >
            <Link
              href={buildLocalizedPath("/privacy", locale)}
              className="text-primary-500 text-xs tracking-wide hover:text-primary-300 transition-colors duration-300"
            >
              {t.footer.privacy}
            </Link>
          </motion.div>

          {/* Copyright */}
          <motion.p
            className="text-primary-500 text-xs tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t.footer.copyright}
          </motion.p>

          {/* Secret settings (triple-clic) */}
          <motion.button
            type="button"
            aria-label="Settings"
            onClick={handleSecretAdminClick}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            viewport={{ once: true }}
            className="mt-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-gold-500/15 text-primary-500 hover:text-gold-400 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.03.03a2.17 2.17 0 0 1-1.53 3.7 2.17 2.17 0 0 1-1.53-.64l-.03-.03a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V21a2.17 2.17 0 1 1-4.34 0v-.05a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-1.98.36l-.03.03a2.17 2.17 0 0 1-3.06 0 2.17 2.17 0 0 1 0-3.06l.03-.03A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3a2.17 2.17 0 1 1 0-4.34h-.05A1.8 1.8 0 0 0 4.6 8.4a1.8 1.8 0 0 0-.36-1.98l-.03-.03a2.17 2.17 0 0 1 3.06-3.06l.03.03A1.8 1.8 0 0 0 9.3 3.6a1.8 1.8 0 0 0 1.1-1.65V2a2.17 2.17 0 1 1 4.34 0v.05a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.03-.03a2.17 2.17 0 0 1 3.06 3.06l-.03.03A1.8 1.8 0 0 0 19.4 8.4a1.8 1.8 0 0 0 1.65 1.1H21a2.17 2.17 0 1 1 0 4.34h-.05a1.8 1.8 0 0 0-1.65 1.1Z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
