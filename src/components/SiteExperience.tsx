"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isBookPath } from "@/lib/analytics-config";

const SmoothScrollProvider = dynamic(() => import("./SmoothScrollProvider"), { ssr: false });
const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });

export default function SiteExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Buying links must remain available in the server HTML and without JavaScript.
  if (isBookPath(pathname)) return <>{children}</>;

  return (
    <>
      <LoadingScreen />
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </>
  );
}
