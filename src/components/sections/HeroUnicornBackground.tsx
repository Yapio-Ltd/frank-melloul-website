"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const UnicornScene = dynamic(
  () => import("unicornstudio-react/next"),
  { ssr: false }
);

const PROJECT_ID = "idBAniEehcHecz1FxhSy";
const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js";

export default function HeroUnicornBackground() {
  const [size, setSize] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.55]"
      aria-hidden="true"
    >
      <UnicornScene
        projectId={PROJECT_ID}
        width={size.width}
        height={size.height}
        scale={1}
        dpi={1.5}
        sdkUrl={SDK_URL}
        className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:object-cover"
        lazyLoad
        altText=""
        ariaLabel=""
      />
    </div>
  );
}
