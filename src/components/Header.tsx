"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { LOCALE_PREFIX, getLocaleFromPath } from "@/lib/locale";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const basePrefix = LOCALE_PREFIX[currentLocale];
  const isHomePage = pathname === (basePrefix || "/");

  // Mark animations as complete after first render
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scroll to section when navigating from another page
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash;
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [isHomePage]);

  // Build navigation items with proper links based on current page
  const navItems = [
    {
      name: t.nav.services,
      href: isHomePage ? "#services" : `${basePrefix}/#services`,
    },
    { name: t.nav.about, href: isHomePage ? "#about" : `${basePrefix}/#about` },
    {
      name: t.nav.biography,
      href: isHomePage ? "#biography" : `${basePrefix}/#biography`,
    },
    { name: t.nav.communication, href: `${basePrefix}/communication` },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-4 bg-navy-950/80 backdrop-blur-md"
            : "py-6 bg-transparent"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={basePrefix || "/"} className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Using native img to avoid Next.js image optimization placeholder */}
                <img
                  src="/only_gold_logo.png"
                  alt="Melloul & Partners"
                  width={120}
                  height={120}
                  style={{ objectFit: "contain" }}
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-12">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={hasAnimated ? false : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: hasAnimated ? 0 : 1.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="text-primary-200 hover:text-gold-500 text-sm tracking-widest uppercase font-medium transition-colors duration-300 animated-underline"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right side: Language Switcher + Contact */}
            <div className="hidden md:flex items-center gap-6">
              <motion.div
                initial={hasAnimated ? false : { opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: hasAnimated ? 0 : 1.3 }}
              >
                <LanguageSwitcher />
              </motion.div>

              <motion.div
                initial={hasAnimated ? false : { opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: hasAnimated ? 0 : 1.4 }}
              >
                <Link
                  href="mailto:contact@melloulandpartners.com"
                  className="group flex items-center gap-2 text-primary-200 hover:text-gold-500 text-sm tracking-widest uppercase font-medium transition-colors duration-300"
                >
                  <span className="w-8 h-[1px] bg-gold-500 group-hover:w-12 transition-all duration-300" />
                  {t.nav.contact}
                  <span className="inline-block animate-arrow-bounce">→</span>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSwitcher />
              <motion.button
                className="relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                initial={hasAnimated ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: hasAnimated ? 0 : 1 }}
              >
                <motion.span
                  className="w-6 h-[2px] bg-primary-200"
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-[2px] bg-primary-200"
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-[2px] bg-primary-200"
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-navy-950 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <nav className="flex flex-col items-center gap-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-3xl font-serif text-primary-100 hover:text-gold-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Link
                  href="mailto:contact@melloulandpartners.com"
                  className="mt-8 btn-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.contact} →
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
