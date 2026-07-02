"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const UnicornScene = dynamic(
  () => import("unicornstudio-react/next"),
  { ssr: false }
);

const PROJECT_ID = "idBAniEehcHecz1FxhSy";
const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js";

const RESIZE_DEBOUNCE_MS = 200;

export default function HeroUnicornBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, RESIZE_DEBOUNCE_MS);
    };

    updateSize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const isPaused = prefersReducedMotion || !isVisible;

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.55]"
      aria-hidden="true"
    >
      <UnicornScene
        projectId={PROJECT_ID}
        width={size.width}
        height={size.height}
        scale={0.75}
        dpi={1}
        fps={30}
        production
        paused={isPaused}
        sdkUrl={SDK_URL}
        className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:object-cover"
        lazyLoad
        altText=""
        ariaLabel=""
      />
    </div>
  );
}
