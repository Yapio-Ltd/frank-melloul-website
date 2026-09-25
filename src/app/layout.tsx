import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import PreloadResources from "@/components/PreloadResources";
import ConsentBanner from "@/components/ConsentBanner";
import GtagMailToTracker from "@/components/GtagMailToTracker";
import { Toaster } from "sonner";
import SiteExperience from "@/components/SiteExperience";
import AnalyticsPageViews from "@/components/AnalyticsPageViews";
import { getAnalyticsBootstrap } from "@/lib/analytics-bootstrap";

export const metadata: Metadata = {
  title: {
    default:
      "Frank Melloul | Melloul & Partners — Global Advisory",
    template: "%s | Frank Melloul — Melloul & Partners",
  },
  description:
    "Frank Melloul is the founder of Melloul & Partners, a global strategic advisory firm. Strategies for influence, diplomacy, and executive counsel for leaders worldwide.",
  keywords: [
    "Frank Melloul",
    "Frank Melloul advisor",
    "Frank Melloul consultant",
    "Melloul & Partners",
    "Melloul and Partners",
    "strategic advisory",
    "global advisory",
    "diplomacy",
    "influence",
    "public affairs",
    "consulting",
    "international affairs",
    "geopolitics",
    "executive counsel",
    "strategic influence",
    "international consulting",
  ],
  authors: [{ name: "Frank Melloul", url: "https://melloulandpartners.com" }],
  creator: "Frank Melloul",
  publisher: "Melloul & Partners",
  metadataBase: new URL("https://melloulandpartners.com"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
  },
  openGraph: {
    title: "Frank Melloul | Melloul & Partners — Global Advisory",
    description:
      "Frank Melloul leads Melloul & Partners: global strategic advisory, influence, and diplomacy for decision-makers.",
    type: "website",
    locale: "en_US",
    url: "https://melloulandpartners.com",
    siteName: "Melloul & Partners",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frank Melloul | Melloul & Partners — Global Advisory",
    description:
      "Frank Melloul leads Melloul & Partners: strategic advisory, influence, and diplomacy.",
    creator: "@frankmelloul",
    site: "@frankmelloul",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const origin = "https://melloulandpartners.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "Melloul & Partners",
        inLanguage: ["en", "fr", "ar"],
        publisher: { "@id": `${origin}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "Melloul & Partners",
        url: `${origin}/`,
        logo: `${origin}/only_gold_logo.webp`,
        description:
          "Global strategic advisory firm specializing in influence, diplomacy, and executive counsel for leaders worldwide.",
        email: "contact@melloulandpartners.com",
        founder: { "@id": `${origin}/#frank-melloul` },
        sameAs: [
          "https://www.linkedin.com/company/melloul-partners-global-advisory/",
          "https://x.com/frankmelloul",
          "https://www.instagram.com/frankmelloul/",
          "https://www.facebook.com/share/1Gs4mWEmU3/",
        ],
      },
      {
        "@type": "Person",
        "@id": `${origin}/#frank-melloul`,
        name: "Frank Melloul",
        givenName: "Frank",
        familyName: "Melloul",
        url: `${origin}/`,
        image: `${origin}/frank_melloul_avatar.webp`,
        description:
          "Founder of Melloul & Partners. Expert in strategic advisory, diplomacy, influence, and international affairs for global leaders.",
        jobTitle: "Founder",
        worksFor: { "@id": `${origin}/#organization` },
        knowsAbout: [
          "strategic advisory",
          "international affairs",
          "public affairs",
          "diplomacy",
          "crisis management",
          "strategic communications",
        ],
        sameAs: [
          "https://x.com/frankmelloul",
          "https://www.instagram.com/frankmelloul/",
          "https://www.facebook.com/share/1Gs4mWEmU3/",
          "https://www.linkedin.com/company/melloul-partners-global-advisory/",
        ],
      },
      {
        "@type": "ProfilePage",
        "@id": `${origin}/#profilepage`,
        url: `${origin}/`,
        name: "Frank Melloul — Melloul & Partners",
        inLanguage: ["en", "fr", "ar"],
        isPartOf: { "@id": `${origin}/#website` },
        mainEntity: { "@id": `${origin}/#frank-melloul` },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          id="google-consent-bootstrap"
          dangerouslySetInnerHTML={{ __html: getAnalyticsBootstrap() }}
        />

        {/* Inline script for immediate preload - executes before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.lang = location.pathname.startsWith('/ar') ? 'ar' : (location.pathname.startsWith('/fr') || location.pathname === '/livre' || location.pathname.startsWith('/livre/')) ? 'fr' : 'en';
                document.documentElement.dir = location.pathname.startsWith('/ar') ? 'rtl' : 'ltr';
                if (!document.querySelector('link[rel="preload"][href="/only_gold_logo.webp"]')) {
                  const link1 = document.createElement('link');
                  link1.rel = 'preload';
                  link1.href = '/only_gold_logo.webp';
                  link1.as = 'image';
                  link1.type = 'image/webp';
                  link1.setAttribute('fetchpriority', 'high');
                  document.head.appendChild(link1);
                }
              })();
            `,
          }}
        />

        {/* JSON-LD (SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="antialiased">
        <PreloadResources />
        <LanguageProvider initialLocale="en">
          <SiteExperience>{children}</SiteExperience>
          <Suspense fallback={null}>
            <AnalyticsPageViews />
          </Suspense>
          <ConsentBanner />
          <GtagMailToTracker />
        </LanguageProvider>

        <Toaster
          richColors
          closeButton
          position="bottom-right"
          theme="dark"
        />
        
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />
      </body>
    </html>
  );
}

