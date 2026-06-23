import { LanguageProvider } from "@/context/LanguageContext";

export default function ArLayout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider initialLocale="ar">{children}</LanguageProvider>;
}
