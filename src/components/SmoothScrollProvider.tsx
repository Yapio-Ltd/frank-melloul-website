"use client";

import { useEffect, useRef, ReactNode, useCallback } from "react";
import Lenis from "@studio-freight/lenis";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const raf = useCallback((time: number) => {
    if (lenisRef.current) {
      lenisRef.current.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    rafRef.current = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            lenis.scrollTo(element as HTMLElement, { offset: -100 });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [raf]);

  return <>{children}</>;
}
