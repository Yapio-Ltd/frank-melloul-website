"use client";

import { useEffect } from "react";

export default function PreloadResources() {
  useEffect(() => {
    // Only add preload if not already present
    if (document.querySelector('link[rel="preload"][href="/only_gold_logo.webp"]')) {
      return;
    }

    // Preload critical images for faster loading
    const preloadLogo = document.createElement("link");
    preloadLogo.rel = "preload";
    preloadLogo.href = "/only_gold_logo.webp";
    preloadLogo.as = "image";
    preloadLogo.type = "image/png";
    preloadLogo.setAttribute("fetchpriority", "high");
    document.head.appendChild(preloadLogo);
  }, []);

  return null;
}
