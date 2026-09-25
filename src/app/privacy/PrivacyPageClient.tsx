"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { buildLocalizedPath } from "@/lib/locale";

const privacyContent = {
  en: {
    back: "← Back to Home",
    title: "Privacy Policy",
    updated: "Last updated: September 25, 2026",
    sections: [
      {
        title: "1. Introduction",
        body: 'Melloul & Partners ("we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you visit melloulandpartners.com (the "Site").',
      },
      {
        title: "2. Information We Collect",
        body: "We may collect contact information, usage data, and technical data when you interact with our Site.",
      },
      {
        title: "3. How We Use Your Information",
        body: "We use the information we collect to respond to inquiries, improve our Site, and comply with legal obligations.",
      },
      {
        title: "4. Data Sharing",
        body: "We do not sell or rent your personal data. We may share data with trusted service providers bound by confidentiality obligations.",
      },
      {
        title: "5. Cookies",
        body: "Google measurement tags load only after you accept cookies. Once configured, Google Analytics 4 measures pages visited and clicks, including departures to Fnac or Amazon through our book links; Google Ads measures advertising conversions on this Site. These book links do not tell us whether you complete a purchase on a retailer’s website. Your choice is stored in your browser when storage is available. You can accept or decline measurement and change your choice using the ‘Cookies’ button at the bottom of the page. Declining does not prevent you from using the book links. Independently of Google, the book redirect counter stores only a daily total for each retailer in our Supabase database. It uses no visitor cookie or identifier and does not record IP addresses, referrers or campaign parameters in that counter. These aggregate totals are not sent to Google Analytics. They count redirect requests, not unique people or purchases.",
        linkLabel: "How Google uses information from sites that use its services",
      },
      {
        title: "6. Data Retention",
        body: "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected.",
      },
      {
        title: "7. Your Rights",
        body: "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data.",
      },
      {
        title: "8. Security",
        body: "We implement appropriate technical and organisational measures to protect your personal data.",
      },
      {
        title: "9. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. Changes will be posted on this page.",
      },
      {
        title: "10. Contact",
        body: "For any questions regarding this Privacy Policy, please contact us at contact@melloulandpartners.com.",
      },
    ],
  },
  fr: {
    back: "← Retour à l'accueil",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 25 septembre 2026",
    sections: [
      {
        title: "1. Introduction",
        body: "Melloul & Partners (« nous ») s'engage à protéger vos données personnelles et à respecter votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos informations lorsque vous visitez melloulandpartners.com.",
      },
      {
        title: "2. Informations collectées",
        body: "Nous pouvons collecter des informations de contact, des données d'utilisation et des données techniques lorsque vous interagissez avec notre Site.",
      },
      {
        title: "3. Utilisation des informations",
        body: "Nous utilisons ces informations pour répondre à vos demandes, améliorer notre Site et respecter nos obligations légales.",
      },
      {
        title: "4. Partage des données",
        body: "Nous ne vendons ni ne louons vos données personnelles. Nous pouvons les partager avec des prestataires de confiance soumis à des obligations de confidentialité.",
      },
      {
        title: "5. Cookies",
        body: "Les balises de mesure de Google sont chargées uniquement après votre acceptation des cookies. Une fois configuré, Google Analytics 4 mesure les pages consultées et les clics, notamment les départs vers la Fnac ou Amazon via nos liens vers le livre ; Google Ads mesure les conversions publicitaires sur ce Site. Ces liens ne nous indiquent pas si vous achetez ensuite le livre sur le site du libraire. Votre choix est enregistré dans votre navigateur lorsque le stockage est disponible. Vous pouvez accepter ou refuser la mesure et modifier votre choix avec le bouton « Cookies » en bas de page. Le refus n’empêche pas d’utiliser les liens vers le livre. Indépendamment de Google, le compteur des redirections du livre conserve uniquement un total quotidien par libraire dans notre base Supabase. Ce compteur n’utilise aucun cookie ni identifiant de visiteur et n’enregistre ni adresse IP, ni page d’origine, ni paramètre de campagne. Ces totaux agrégés ne sont pas transmis à Google Analytics. Ils comptabilisent les demandes de redirection, pas des personnes uniques ni des achats.",
        linkLabel: "Comment Google utilise les informations des sites qui font appel à ses services",
      },
      {
        title: "6. Conservation des données",
        body: "Nous conservons les données personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées.",
      },
      {
        title: "7. Vos droits",
        body: "Selon votre juridiction, vous pouvez disposer de droits d'accès, de rectification, de suppression ou de limitation du traitement de vos données.",
      },
      {
        title: "8. Sécurité",
        body: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles.",
      },
      {
        title: "9. Modifications",
        body: "Nous pouvons mettre à jour cette politique. Toute modification sera publiée sur cette page.",
      },
      {
        title: "10. Contact",
        body: "Pour toute question relative à cette politique, contactez-nous à contact@melloulandpartners.com.",
      },
    ],
  },
  ar: {
    back: "← العودة إلى الصفحة الرئيسية",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 25 سبتمبر 2026",
    sections: [
      {
        title: "1. المقدمة",
        body: "تلتزم Melloul & Partners (« نحن ») بحماية بياناتكم الشخصية واحترام خصوصيتكم. توضّح هذه السياسة كيفية جمع معلوماتكم واستخدامها وحمايتها عند زيارة melloulandpartners.com.",
      },
      {
        title: "2. المعلومات التي نجمعها",
        body: "قد نجمع معلومات الاتصال وبيانات الاستخدام والبيانات التقنية عند تفاعلكم مع موقعنا.",
      },
      {
        title: "3. كيفية استخدام المعلومات",
        body: "نستخدم هذه المعلومات للرد على استفساراتكم وتحسين موقعنا والامتثال للالتزامات القانونية.",
      },
      {
        title: "4. مشاركة البيانات",
        body: "لا نبيع أو نؤجّر بياناتكم الشخصية. قد نشاركها مع مزوّدين موثوقين ملزمين بالسرّية.",
      },
      {
        title: "5. ملفات تعريف الارتباط",
        body: "لا تُحمَّل أدوات القياس من Google إلا بعد قبولكم ملفات تعريف الارتباط. بعد إعداده، يقيس Google Analytics 4 الصفحات التي تزورونها والنقرات، بما فيها الانتقال إلى Fnac أو Amazon عبر روابط الكتاب على موقعنا؛ ويقيس Google Ads التحويلات الإعلانية على هذا الموقع. لا تُخبرنا هذه الروابط بما إذا كنتم قد اشتريتم الكتاب لاحقاً على موقع البائع. يُحفظ اختياركم في المتصفح عندما يكون التخزين متاحاً. يمكنكم قبول القياس أو رفضه وتغيير اختياركم باستخدام زر «ملفات الارتباط» أسفل الصفحة. لا يمنع الرفض استخدام روابط الكتاب. وبشكل مستقل عن Google، يحتفظ عدّاد تحويلات روابط الكتاب بإجمالي يومي فقط لكل بائع في قاعدة بيانات Supabase الخاصة بنا. لا يستخدم هذا العدّاد ملفات تعريف ارتباط أو معرّفات للزوار، ولا يسجّل عناوين IP أو الصفحات المرجعية أو معلمات الحملات. لا تُرسَل هذه المجاميع إلى Google Analytics. وهي تحصي طلبات التحويل، لا الأشخاص الفريدين أو المشتريات.",
        linkLabel: "كيفية استخدام Google للمعلومات الواردة من المواقع التي تستخدم خدماتها",
      },
      {
        title: "6. الاحتفاظ بالبيانات",
        body: "نحتفظ بالبيانات الشخصية فقط للمدة اللازمة لتحقيق الأغراض التي جُمعت من أجلها.",
      },
      {
        title: "7. حقوقكم",
        body: "بحسب نطاقكم القضائي، قد تتمتعون بحقوق الوصول والتصحيح والحذف أو تقييد معالجة بياناتكم.",
      },
      {
        title: "8. الأمان",
        body: "نطبّق تدابير تقنية وتنظيمية مناسبة لحماية بياناتكم الشخصية.",
      },
      {
        title: "9. التعديلات",
        body: "قد نحدّث هذه السياسة من وقت لآخر. ستُنشر أي تغييرات على هذه الصفحة.",
      },
      {
        title: "10. الاتصال",
        body: "لأي استفسار بخصوص هذه السياسة، يرجى التواصل معنا على contact@melloulandpartners.com.",
      },
    ],
  },
} as const;

export default function PrivacyPageClient() {
  const { locale } = useLanguage();
  const content = privacyContent[locale];

  return (
    <main className="min-h-screen bg-navy-950 text-primary-200 py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href={buildLocalizedPath("/", locale)}
          className="text-gold-400 text-sm tracking-wide hover:text-gold-300 transition-colors mb-12 inline-block"
        >
          {content.back}
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-primary-100 mb-4">
          {content.title}
        </h1>
        <p className="text-primary-400 text-sm mb-12">{content.updated}</p>

        <div className="space-y-10 text-primary-300 leading-relaxed">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-medium text-gold-400 uppercase tracking-wide mb-4">
                {section.title}
              </h2>
              <p>{section.body}</p>
              {"linkLabel" in section && (
                <p className="mt-3">
                  <a
                    href={`https://policies.google.com/technologies/partner-sites?hl=${locale}`}
                    className="text-gold-300 underline underline-offset-4 hover:text-gold-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
                  >
                    {section.linkLabel}
                  </a>
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
