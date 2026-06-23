import type { Locale } from "./locale";

export type { Locale };

export const translations = {
  en: {
    // Navigation
    nav: {
      services: "Services",
      about: "About",
      biography: "Biography",
      communication: "Communication",
      contact: "Contact",
    },
    // Hero
    hero: {
      founderName: "Frank Melloul",
      companyName: "MELLOUL & Partners",
      globalAdvisory: "Global Advisory",
      taglinePart1: "Strategy for ",
      taglineHighlight1: "Influence",
      taglinePart2: " and ",
      taglineHighlight2: "Diplomacy",
      title: "Empowers leaders to shape agendas, unlock opportunities, and create lasting impact.",
      discover: "Discover",
      // Words to highlight in gold
      highlightWords: ["leaders", "agendas,", "opportunities", "impact"],
    },
    // Services
    services: {
      title: "Our Services",
      items: [
        {
          id: "strategy",
          title: "Global Strategy & Executive Advisory",
          subtitle: "Global Strategy & Executive Advisory",
          description:
            "Leveraging a worldwide vision and proven expertise, Melloul & Partners advises leaders in defining and executing ambitious global strategies. We help decision-makers anticipate geopolitical and economic shifts, identify emerging opportunities, and navigate complex environments. Our exclusive approach—shaped by experience at the highest levels—ensures clients make informed and confident decisions. By combining strategic perspective with operational pragmatism, we strengthen our clients' competitiveness and international reach.",
        },
        {
          id: "diplomacy",
          title: "Influence Diplomacy & Global Public Affairs",
          subtitle: "Influence Diplomacy & Global Public Affairs",
          description:
            "With an exceptional international diplomatic network, we support our clients in forging strategic alliances and gaining access to key decision-makers on the global stage. Melloul & Partners excels at representing and advancing our clients' interests with governments, institutions, and international forums. Our command of public affairs and influence diplomacy enables us to shape an environment conducive to our clients' ambitions. By cultivating trusted relationships at the highest levels, we give our clients an influential voice and a strategic position on the global chessboard.",
        },
        {
          id: "communications",
          title: "High-Level Strategic Communication",
          subtitle: "High-Level Strategic Communication",
          description:
            "In a world where leaders' image and messaging are paramount, Melloul & Partners guides strategic, high-impact communications at the highest level. We develop bespoke influence narratives and counsel our clients in their public, media, and institutional engagements. Experienced in handling sensitive and complex communication challenges, we help leaders inspire trust and enhance their credibility among key stakeholders. Our exclusive expertise ensures our clients' media profile is carefully managed and their thought leadership recognized on the international stage.",
        },
        {
          id: "crisis",
          title: "High-Stakes Crisis Management & Strategic Resilience",
          subtitle: "High-Stakes Crisis Management & Strategic Resilience",
          description:
            "In the face of the most sensitive crises, Melloul & Partners acts as a trusted partner to safeguard our clients' vital interests and reputation. Our crisis unit, available 24/7, provides strategic leadership, controlled crisis communications, and discreet coordination with critical stakeholders. Backed by experience managing complex crises at the highest levels of government and business, we anticipate emerging risks and contain their impact. Our proactive and confidential approach enables clients to overcome adversity, preserve public trust, and reinforce their long-term resilience.",
        },
      ],
    },
    // About
    about: {
      title: "About",
      sections: [
        {
          title: "Mission and Purpose",
          content: "Melloul & Partners' mission is to guide leaders, governments, and institutions through their most complex strategic, media, and geopolitical challenges. We help our clients anticipate geopolitical shifts, manage their international communications, and safeguard their interests on the global stage. The firm's core purpose is to provide decision-makers with a unique global perspective and the assurance to navigate a constantly evolving world.",
        },
        {
          title: "Distinctive Approach",
          content: "Melloul & Partners' success is built on an advisory approach that is highly discreet, personalized, and confidential. Each engagement is tailored to the client's specific needs and conducted in strict confidence. With a finely tuned understanding of international dynamics, we deliver strategic solutions that are relevant, pragmatic, and immediately actionable.",
        },
        {
          title: "Global Reach and Ambition",
          content: "Melloul & Partners operates on a global scale, drawing on a worldwide network of partners and experts. This global reach allows us to support our clients across all continents, with a deep understanding of local contexts. Our ambition is to become the trusted partner of choice for leaders seeking to address the strategic, media, and geopolitical challenges of the 21st century.",
        },
      ],
      valuesTitle: "Our Values",
      values: [
        {
          number: "01",
          title: "Excellence",
          description:
            "A commitment to achieving the highest quality in every engagement.",
        },
        {
          number: "02",
          title: "Rigor",
          description:
            "Uncompromising discipline in analysis and execution, with attention to every detail.",
        },
        {
          number: "03",
          title: "Loyalty",
          description:
            "Unwavering loyalty to our clients' best interests.",
        },
        {
          number: "04",
          title: "Foresight",
          description:
            "Anticipating global developments to stay ahead of the curve.",
        },
        {
          number: "05",
          title: "Trust",
          description:
            "Mutual trust built on integrity and confidentiality.",
        },
      ],
    },
    // Biography
    biography: {
      title: "Biography",
      paragraphs: [
        "In 2025, Frank Melloul founded MELLOUL & Partners, an international consulting firm specializing in diplomacy, influence, media, and strategy. This firm embodies his strategic ambition: to provide public and private decision-makers with high-level advisory services at the intersection of diplomacy, global influence, and international media.",
        "A diplomat by training, Frank Melloul began his career in the service of the French state. In 2001, he took on roles at the Ministry of Foreign Affairs, focusing on strategic affairs and international crisis management. He later served as a communications advisor within the French government, notably to Prime Minister Dominique de Villepin from 2005 to 2007, contributing to France's international strategy. In 2010, he was entrusted with drafting France's global influence strategy – a mission that cemented his reputation as an expert in public diplomacy and strategic communications.",
        "Building on these high-level government experiences, Frank Melloul transitioned to international media in 2007. He contributed to the launch of the France 24 news channel as its Director of Strategy and Development. He continued his work at Audiovisuel Extérieur de la France (now France Médias Monde), overseeing strategy and public affairs for France's global media outlets such as France 24 and RFI. In 2013, Frank Melloul undertook a new challenge by creating i24NEWS, the first 24/7 international news channel based in Israel. Under his leadership, i24NEWS expanded into a multilingual network with audiences across multiple continents, including the launch of Israel's first-ever 24/7 news channel in Hebrew.",
        "MELLOUL & Partners represents the natural culmination of Frank Melloul's unique career at the crossroads of government, global influence, and international media. He leverages the full scope of expertise gained at the highest levels of these three domains to advise his clients – from public institutions to private sector leaders – on their international influence, diplomacy, and strategic communications in an increasingly complex global arena.",
        "In June 2026, against the backdrop of the deepening Abraham Accords and profound economic and geopolitical transformations underway in the region, the Haifa Bay Authorities announced the appointment of Mr. Frank Melloul as Ambassador of the Cluster, with a mandate to define and advance its international public diplomacy strategy.",
      ],
      stats: [
        { label: "Years of experience", value: "20+" },
        { label: "Clients advised", value: "150+" },
        { label: "Countries of intervention", value: "40+" },
      ],
    },
    // Contact
    contact: {
      title: "Let's build your success together",
      subtitle:
        "Let's discuss your objectives and discover how our expertise can guide you toward new horizons.",
      button: "Contact Us",
      email: "Email",
      location: "Location",
      locationValue: "Paris • Dubai",
    },
    // Footer
    footer: {
      copyright: "© 2025 MELLOUL & Partners. Global Advisory.",
      privacy: "Privacy Policy",
    },
  },
  fr: {
    // Navigation
    nav: {
      services: "Services",
      about: "À Propos",
      biography: "Biographie",
      communication: "Communication",
      contact: "Contact",
    },
    // Hero
    hero: {
      founderName: "Frank Melloul",
      companyName: "MELLOUL & Partners",
      globalAdvisory: "Global Advisory",
      taglinePart1: "Stratégie pour l'",
      taglineHighlight1: "Influence",
      taglinePart2: " et la ",
      taglineHighlight2: "Diplomatie",
      title: "Accompagne les leaders pour façonner les agendas, débloquer les opportunités et créer un impact durable.",
      discover: "Découvrir",
      // Words to highlight in gold
      highlightWords: ["leaders", "agendas,", "opportunités", "impact"],
    },
    // Services
    services: {
      title: "Nos Services",
      items: [
        {
          id: "strategy",
          title: "Stratégie Globale et Conseil Exécutif",
          subtitle: "Stratégie Globale et Conseil Exécutif",
          description:
            "En s'appuyant sur une vision mondiale et une expertise éprouvée, Melloul & Partners conseille les dirigeants dans la définition et la mise en œuvre de stratégies globales ambitieuses. Nous aidons les décideurs à anticiper les évolutions géopolitiques et économiques, à identifier des opportunités émergentes et à naviguer des environnements complexes. Notre approche exclusive, forgée par une expérience au sein des plus hautes instances, assure à nos clients une prise de décision éclairée et confiante. En alliant perspective stratégique et pragmatisme opérationnel, nous renforçons la compétitivité et le rayonnement international de nos clients.",
        },
        {
          id: "diplomacy",
          title: "Diplomatie d'Influence & Affaires Publiques Internationales",
          subtitle: "Diplomatie d'Influence & Affaires Publiques Internationales",
          description:
            "Grâce à un réseau diplomatique international d'exception, nous accompagnons nos clients dans la construction d'alliances stratégiques et l'accès aux décideurs clés sur la scène mondiale. Melloul & Partners excelle à représenter et défendre les intérêts de ses clients auprès des gouvernements, des institutions et des forums internationaux. Notre maîtrise des affaires publiques et de la diplomatie d'influence permet de façonner un environnement favorable aux ambitions de nos clients. En cultivant des relations de confiance au plus haut niveau, nous offrons à nos clients une voix influente et une position stratégique sur l'échiquier international.",
        },
        {
          id: "communications",
          title: "Communication Stratégique de Haut Niveau",
          subtitle: "Communication Stratégique de Haut Niveau",
          description:
            "Dans un monde où l'image et le discours des dirigeants sont déterminants, Melloul & Partners oriente une communication stratégique et percutante au plus haut niveau. Nous élaborons des narratifs d'influence sur mesure et conseillons nos clients dans leurs prises de parole publiques, médiatiques et institutionnelles. Habitués à gérer des enjeux de communication sensibles et complexes, nous aidons les dirigeants à inspirer confiance et à renforcer leur crédibilité auprès des parties prenantes clés. Notre expertise exclusive garantit à nos clients un positionnement médiatique maîtrisé et un leadership d'opinion reconnu à l'international.",
        },
        {
          id: "crisis",
          title: "Gestion des Crises Sensibles & Résilience Stratégique",
          subtitle: "Gestion des Crises Sensibles & Résilience Stratégique",
          description:
            "Face aux situations de crise les plus sensibles, Melloul & Partners intervient en partenaire de confiance pour protéger les intérêts vitaux et la réputation de ses clients. Notre cellule de crise, disponible 24h/24 et 7j/7, apporte un pilotage stratégique, une communication de crise maîtrisée et une coordination discrète avec les parties prenantes critiques. Forts d'une expérience de gestion de crises complexes au plus haut niveau de l'État et de l'entreprise, nous savons anticiper les risques émergents et limiter leur impact. Notre approche proactive et confidentielle permet à nos clients de surmonter l'adversité, de préserver la confiance du public et de renforcer leur résilience à long terme.",
        },
      ],
    },
    // About
    about: {
      title: "À Propos",
      sections: [
        {
          title: "Mission et Raison d'Être",
          content: "La mission de Melloul & Partners est d'accompagner les dirigeants, gouvernements et institutions dans leurs enjeux stratégiques, médiatiques et géopolitiques. Nous aidons nos clients à anticiper les évolutions géopolitiques, à maîtriser leur communication internationale et à défendre leurs intérêts sur la scène mondiale. La raison d'être du cabinet est d'offrir aux décideurs une perspective globale unique et l'assurance nécessaire pour naviguer avec confiance dans un monde en perpétuelle évolution.",
        },
        {
          title: "Approche Différenciante",
          content: "La réussite de Melloul & Partners repose sur une approche de conseil résolument discrète, personnalisée et confidentielle, assurant à chaque client un accompagnement sur mesure mené dans la plus stricte confidentialité. Grâce à une compréhension fine des dynamiques internationales, nous élaborons des solutions stratégiques pertinentes, pragmatiques et immédiatement opérationnelles.",
        },
        {
          title: "Portée Globale et Ambition",
          content: "Melloul & Partners opère à l'échelle internationale en s'appuyant sur un réseau mondial de partenaires et d'experts. Cette portée globale permet d'accompagner nos clients sur tous les continents, avec une compréhension approfondie des contextes locaux. Notre ambition est de devenir le partenaire de confiance incontournable pour les leaders qui cherchent à relever les défis stratégiques, médiatiques et géopolitiques du XXIe siècle.",
        },
      ],
      valuesTitle: "Nos Valeurs",
      values: [
        {
          number: "01",
          title: "Excellence",
          description:
            "Engagement à atteindre le plus haut niveau de qualité dans chaque mission.",
        },
        {
          number: "02",
          title: "Exigence",
          description:
            "Rigueur absolue dans l'analyse et la mise en œuvre, avec une attention au moindre détail.",
        },
        {
          number: "03",
          title: "Loyauté",
          description:
            "Fidélité inconditionnelle aux intérêts de nos clients.",
        },
        {
          number: "04",
          title: "Anticipation",
          description:
            "Prévoyance et proactivité pour devancer les évolutions du contexte mondial.",
        },
        {
          number: "05",
          title: "Confiance",
          description:
            "Relation mutuelle bâtie sur l'intégrité et la confidentialité.",
        },
      ],
    },
    // Biography
    biography: {
      title: "Biographie",
      paragraphs: [
        "En 2025, Frank Melloul fonde MELLOUL & Partners, un cabinet de conseil international spécialisé en diplomatie, influence, médias et stratégie. Ce cabinet incarne l'ambition de son fondateur : offrir aux décideurs publics et privés un accompagnement stratégique de haut niveau, à la croisée de la diplomatie, de l'influence et des médias internationaux.",
        "Diplomate de formation, Frank Melloul a débuté sa carrière au service de l'État français. Dès 2001, il occupe des fonctions au ministère des Affaires étrangères, se spécialisant dans les questions stratégiques et la gestion de crises internationales. Il devient ensuite conseiller en communication au sein du gouvernement, notamment auprès du Premier ministre Dominique de Villepin de 2005 à 2007, contribuant à la stratégie internationale de la France. En 2010, il est chargé d'élaborer la stratégie d'influence de la France sur la scène mondiale – une mission qui consacre son expertise en diplomatie d'influence.",
        "Fort de ces expériences au cœur de l'appareil d'État, Frank Melloul se tourne vers les médias internationaux à partir de 2007. Il participe au lancement de la chaîne d'information France 24 en tant que directeur de la stratégie et du développement. Il poursuit sa mission au sein de l'Audiovisuel Extérieur de la France (aujourd'hui France Médias Monde), où il pilote la stratégie et les affaires publiques des médias français à vocation mondiale, de France 24 à RFI. En 2013, Frank Melloul relève un nouveau défi en créant i24NEWS, première chaîne d'information internationale en continu basée en Israël. Sous sa direction, i24NEWS déploie des rédactions en plusieurs langues et étend son audience sur plusieurs continents, notamment avec le lancement du premier canal d'information 24/7 en hébreu – une première historique en Israël.",
        "MELLOUL & Partners est ainsi l'aboutissement naturel du parcours unique de Frank Melloul, au carrefour de l'État, de l'influence et des médias internationaux. Il y mobilise l'ensemble de l'expertise acquise au plus haut niveau de ces trois sphères pour accompagner ses clients – qu'ils soient acteurs publics ou dirigeants du secteur privé – dans leurs stratégies de rayonnement, de diplomatie et de communication à l'échelle mondiale.",
        "En juin 2026, dans le contexte du renforcement des Accords d'Abraham et des profondes transformations économiques et géopolitiques à l'œuvre dans la région, les Autorités de la Baie de Haïfa annoncent la nomination de M. Frank Melloul en qualité d'ambassadeur du Cluster, avec pour mission de définir et de porter sa stratégie de diplomatie publique à l'international.",
      ],
      stats: [
        { label: "Années d'expérience", value: "20+" },
        { label: "Clients conseillés", value: "150+" },
        { label: "Pays d'intervention", value: "40+" },
      ],
    },
    // Contact
    contact: {
      title: "Construisons ensemble votre succès",
      subtitle:
        "Discutons de vos objectifs et découvrez comment notre expertise peut vous accompagner vers de nouveaux horizons.",
      button: "Nous Contacter",
      email: "Email",
      location: "Localisation",
      locationValue: "Paris • Dubai",
    },
    // Footer
    footer: {
      copyright: "© 2025 MELLOUL & Partners. Global Advisory.",
      privacy: "Politique de confidentialité",
    },
  },
  ar: {
    nav: {
      services: "الخدمات",
      about: "من نحن",
      biography: "السيرة الذاتية",
      communication: "التواصل",
      contact: "اتصل بنا",
    },
    hero: {
      founderName: "Frank Melloul",
      companyName: "MELLOUL & Partners",
      globalAdvisory: "Global Advisory",
      taglinePart1: "استراتيجية ",
      taglineHighlight1: "التأثير",
      taglinePart2: " و",
      taglineHighlight2: "الدبلوماسية",
      title: "تمكّن القادة من تشكيل الأجندات، وفتح الفرص، وخلق أثرٍ مستدام.",
      discover: "اكتشف",
      highlightWords: ["القادة", "الأجندات،", "الفرص", "أثرٍ"],
    },
    services: {
      title: "خدماتنا",
      items: [
        {
          id: "strategy",
          title: "الاستراتيجية العالمية والاستشارات التنفيذية",
          subtitle: "الاستراتيجية العالمية والاستشارات التنفيذية",
          description:
            "بالاعتماد على رؤية عالمية وخبرة مثبتة، يقدّم Melloul & Partners استشارات للقادة في وضع وتنفيذ استراتيجيات عالمية طموحة. نساعد صناع القرار على استباق التحولات الجيوسياسية والاقتصادية، وتحديد الفرص الناشئة، والتنقل في بيئات معقّدة. يضمن نهجنا الحصري — المبني على خبرة على أعلى المستويات — اتخاذ قرارات مستنيرة وواثقة. وبدمج المنظور الاستراتيجي مع الواقعية التشغيلية، نعزّز تنافسية عملائنا وامتدادهم الدولي.",
        },
        {
          id: "diplomacy",
          title: "دبلوماسية التأثير والشؤون العامة الدولية",
          subtitle: "دبلوماسية التأثير والشؤون العامة الدولية",
          description:
            "بفضل شبكة دبلوماسية دولية استثنائية، نرافق عملاءنا في بناء التحالفات الاستراتيجية والوصول إلى صناع القرار الرئيسيين على الساحة العالمية. يتفوّق Melloul & Partners في تمثيل مصالح عملائنا والدفاع عنها لدى الحكومات والمؤسسات والمنتديات الدولية. تمكّننا خبرتنا في الشؤون العامة ودبلوماسية التأثير من تشكيل بيئة مواتية لطموحات عملائنا. ومن خلال بناء علاقات ثقة على أعلى المستويات، نمنح عملاءنا صوتاً مؤثراً وموقعاً استراتيجياً على رقعة الشطرنج العالمية.",
        },
        {
          id: "communications",
          title: "الاتصالات الاستراتيجية رفيعة المستوى",
          subtitle: "الاتصالات الاستراتيجية رفيعة المستوى",
          description:
            "في عالمٍ تكون فيه صورة القادة ورسائلهم محورية، يوجّه Melloul & Partners اتصالات استراتيجية عالية التأثير على أعلى المستويات. نطوّر سرديات تأثير مخصّصة ونرشد عملاءنا في خطاباتهم العامة والإعلامية والمؤسسية. وبفضل خبرتنا في إدارة قضايا الاتصال الحساسة والمعقّدة، نساعد القادة على بثّ الثقة وتعزيز مصداقيتهم لدى أصحاب المصلحة الرئيسيين. تضمن خبرتنا الحصرية إدارة دقيقة للحضور الإعلامي لعملائنا والاعتراف بريادتهم الفكرية على الساحة الدولية.",
        },
        {
          id: "crisis",
          title: "إدارة الأزمات الحساسة والمرونة الاستراتيجية",
          subtitle: "إدارة الأزمات الحساسة والمرونة الاستراتيجية",
          description:
            "في مواجهة أكثر الأزمات حساسية، يتدخّل Melloul & Partners كشريك موثوق لحماية المصالح الحيوية وسمعة عملائنا. توفر وحدة الأزمات لدينا، المتاحة على مدار الساعة طوال أيام الأسبوع، قيادة استراتيجية واتصالات أزمات مضبوطة وتنسيقاً سرياً مع أصحاب المصلحة الحاسمين. مدعومين بخبرة في إدارة أزمات معقّدة على أعلى مستويات الحكومة والأعمال، نستبق المخاطر الناشئة ونحدّ من تأثيرها. يمكّن نهجنا الاستباقي والسري عملاءنا من تجاوز الشدائد والحفاظ على ثقة الجمهور وتعزيز مرونتهم على المدى الطويل.",
        },
      ],
    },
    about: {
      title: "من نحن",
      sections: [
        {
          title: "المهمة والغاية",
          content:
            "تتمثّل مهمة Melloul & Partners في مرافقة القادة والحكومات والمؤسسات في أعقد تحدياتهم الاستراتيجية والإعلامية والجيوسياسية. نساعد عملاءنا على استباق التحولات الجيوسياسية، وإتقان اتصالاتهم الدولية، والدفاع عن مصالحهم على الساحة العالمية. وتتمثّل غاية الشركة في تزويد صناع القرار بمنظور عالمي فريد والثقة اللازمة للتنقل في عالم يتغيّر باستمرار.",
        },
        {
          title: "نهجنا المميّز",
          content:
            "تقوم نجاحات Melloul & Partners على نهج استشاري يتميّز بالسرّية والتخصيص والثقة، مع ضمان مرافقة مخصّصة لكل عميل في سرّية تامة. وبفهم دقيق للتحولات الدولية، نطوّر حلولاً استراتيجية ذات صلة وعملية وقابلة للتطبيق فوراً.",
        },
        {
          title: "الانتشار العالمي والطموح",
          content:
            "يعمل Melloul & Partners على نطاق عالمي، مستفيداً من شبكة دولية من الشركاء والخبراء. يتيح هذا الانتشار العالمي مرافقة عملائنا في جميع القارات، مع فهم عميق للسياقات المحلية. وطموحنا أن نصبح الشريك الموثوق مرجعياً للقادة الساعين إلى مواجهة التحديات الاستراتيجية والإعلامية والجيوسياسية للقرن الحادي والعشرين.",
        },
      ],
      valuesTitle: "قيمنا",
      values: [
        {
          number: "01",
          title: "التميّز",
          description: "الالتزام بتحقيق أعلى مستويات الجودة في كل مهمة.",
        },
        {
          number: "02",
          title: "الانضباط",
          description: "دقة مطلقة في التحليل والتنفيذ، مع الاهتمام بأدق التفاصيل.",
        },
        {
          number: "03",
          title: "الولاء",
          description: "ولاء لا يتزعزع لمصالح عملائنا.",
        },
        {
          number: "04",
          title: "البصيرة",
          description: "استباق التطورات العالمية للبقاء في الطليعة.",
        },
        {
          number: "05",
          title: "الثقة",
          description: "علاقة متبادلة قائمة على النزاهة والسرّية.",
        },
      ],
    },
    biography: {
      title: "السيرة الذاتية",
      paragraphs: [
        "في عام 2025، أسّس Frank Melloul شركة MELLOUL & Partners، وهي شركة استشارات دولية متخصّصة في الدبلوماسية والتأثير والإعلام والاستراتيجية. تجسّد هذه الشركة طموحه الاستراتيجي: تقديم استشارات رفيعة المستوى لصناع القرار في القطاعين العام والخاص، عند تقاطع الدبلوماسية والتأثير العالمي والإعلام الدولي.",
        "دبلوماسي بالتكوين، بدأ Frank Melloul مسيرته في خدمة الدولة الفرنسية. منذ 2001، شغل مناصب في وزارة الخارجية، متخصّصاً في الشؤون الاستراتيجية وإدارة الأزمات الدولية. ثم أصبح مستشاراً في الاتصال ضمن الحكومة، ولا سيّما لدى رئيس الوزراء Dominique de Villepin بين 2005 و2007، مساهماً في الاستراتيجية الدولية لفرنسا. في 2010، تولّى إعداد استراتيجية التأثير الفرنسية على الساحة العالمية — مهمة رسّخت سمعته كخبير في الدبلوماسية العامة والاتصالات الاستراتيجية.",
        "انطلاقاً من هذه الخبرات على أعلى مستويات الدولة، توجّه Frank Melloul نحو الإعلام الدولي ابتداءً من 2007. شارك في إطلاق قناة France 24 بصفته مدير الاستراتيجية والتطوير. وواصل مسيرته في Audiovisuel Extérieur de la France (France Médias Monde اليوم)، حيث أشرف على الاستراتيجية والشؤون العامة للوسائط الفرنسية ذات البعد العالمي، من France 24 إلى RFI. في 2013، خوض Frank Melloul تحدياً جديداً بإنشاء i24NEWS، أول قناة إخبارية دولية على مدار الساعة مقرّها في إسرائيل. تحت قيادته، توسّعت i24NEWS لتصبح شبكة متعددة اللغات بجمهور في عدة قارات، بما في ذلك إطلاق أول قناة إخبارية على مدار الساعة باللغة العبرية في إسرائيل.",
        "يمثّل MELLOUL & Partners التتويج الطبيعي للمسار الفريد لـ Frank Melloul عند تقاطع الدولة والتأثير والإعلام الدولي. يُ movilise مجموعة خبراته المكتسبة على أعلى المستويات في هذه المجالات الثلاثة لمرافقة عملائه — سواء من المؤسسات العامة أو قادة القطاع الخاص — في استراتيجياتهم للتأثير والدبلوماسية والاتصال على الساحة العالمية المتزايدة التعقيد.",
        "في يونيو 2026، في سياق تعزيز اتفاقيات إبراهيم والتحولات الاقتصادية والجيوسياسية العميقة الجارية في المنطقة، أعلنت سلطات خليج حيفا عن تعيين السيد Frank Melloul سفيراً للمجمع، مكلفاً بتحديد استراتيجية الدبلوماسية العامة الدولية للمجمع والدفاع عنها.",
      ],
      stats: [
        { label: "سنوات الخبرة", value: "20+" },
        { label: "عملاء تمت استشارتهم", value: "150+" },
        { label: "دول التدخّل", value: "40+" },
      ],
    },
    contact: {
      title: "لنبني نجاحكم معاً",
      subtitle:
        "لنناقش أهدافكم ونكتشف كيف يمكن لخبرتنا أن ترافقكم نحو آفاق جديدة.",
      button: "اتصل بنا",
      email: "البريد الإلكتروني",
      location: "الموقع",
      locationValue: "Paris • Dubai",
    },
    footer: {
      copyright: "© 2025 MELLOUL & Partners. Global Advisory.",
      privacy: "سياسة الخصوصية",
    },
  },
} as const;

export type Translations = typeof translations[Locale];

