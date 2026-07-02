"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_DISPLAY_MS = 1500;

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/only_gold_logo.webp";
    img.onload = () => setIsLogoLoaded(true);
  }, []);

  useEffect(() => {
    const start = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
      return;
    }

    window.addEventListener("load", finishLoading, { once: true });
    return () => window.removeEventListener("load", finishLoading);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-navy-950 z-[10000] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLogoLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="flex flex-col items-center gap-6">
              <img
                src="/only_gold_logo.webp"
                alt="Melloul & Partners"
                width={250}
                height={250}
                style={{ objectFit: "contain" }}
              />
            </div>

            <motion.div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-[1px] bg-gold-500/30 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-gold-500"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                style={{ width: "50%" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
