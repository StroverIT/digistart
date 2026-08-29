export const GOOGLE_FREE_ANALYSIS_PAGE_PATH = "/google/free-analysis" as const;
export const GOOGLE_FREE_ANALYSIS_SOURCE_DEFAULT = "google-free-analysis" as const;
export const GOOGLE_FREE_ANALYSIS_FORM_ID = "free-analysis-form" as const;

/** Prof Results–style offer: free audit with 3 actionable fixes. */
export const GOOGLE_ANALYSIS_3_TIPS_PAGE_PATH = "/google/analysis-3-tips" as const;
export const GOOGLE_ANALYSIS_3_TIPS_SOURCE = "analysis-3-tips" as const;
export const GOOGLE_ANALYSIS_3_TIPS_FORM_ID = "analysis-3-tips-form" as const;

export type GoogleFreeAnalysisUrgency = "today" | "tomorrow" | "few_weeks";
export type GoogleFreeAnalysisLeadStatus = "pending" | "done";

export const GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS: {
  value: GoogleFreeAnalysisUrgency;
  label: string;
}[] = [
    { value: "today", label: "Днес" },
    { value: "tomorrow", label: "Утре" },
    { value: "few_weeks", label: "След няколко седмици" },
  ];

export const GOOGLE_FREE_ANALYSIS_STATUS_OPTIONS: {
  value: GoogleFreeAnalysisLeadStatus;
  label: string;
}[] = [
    { value: "pending", label: "Чака видео" },
    { value: "done", label: "Готово" },
  ];

export function getGoogleFreeAnalysisUrgencyLabel(value: string) {
  return (
    GOOGLE_FREE_ANALYSIS_URGENCY_OPTIONS.find((entry) => entry.value === value)?.label ?? value
  );
}

export function getGoogleFreeAnalysisStatusLabel(value: string) {
  return (
    GOOGLE_FREE_ANALYSIS_STATUS_OPTIONS.find((entry) => entry.value === value)?.label ?? value
  );
}

export const googleFreeAnalysisFormFields = {
  name: "Две имена",
  email: "Бизнес имейл",
  phone: "Телефонен номер",
  website: "Уебсайт",
  company: "Име на фирмата",
  googleMapsUrl: "URL на Google Maps профила",
  urgency: "До кога искаш да решиш този проблем?",
} as const;

export const GOOGLE_FREE_ANALYSIS_MARKETING_CONSENT =
  "С натискане на „Изпрати“ се съгласяваш да получаваш маркетингови съобщения от DigiStart по имейл, телефон и/или SMS. Можеш да се отпишеш по всяко време чрез линка за отписване в нашите имейли или като се свържеш с нас." as const;

export const googleFreeAnalysisContent = {
  formPage: {
    badge: "Безплатно",
    title: "Анализирай профила си",
    description:
      "Попълни формата и ще запишем персонализиран анализ с точните неща, които трябва да се случат, за да се класираш в топ 3 в твоя район.",
    disclaimer:
      "Без разходи, без задължения, без досадни опити за продажба. Гарантирано.",
    submit: "Изпрати",
    consent: GOOGLE_FREE_ANALYSIS_MARKETING_CONSENT,
    successTitle: "Готово - получихме заявката ти.",
    successDescription:
      "Ще запишем персонализирания анализ и ще се свържем с теб на посочения имейл.",
  },
  /** Landing modeled on Prof Results /offer/gmb — “Free Analysis: 3 Things…”. */
  analysis3TipsPage: {
    hero: {
      title:
        "Безплатен анализ: 3 неща, които лесно да промениш, за да се класираш по-високо в Google",
      description:
        "Ще одитираме Google Business профила ти безплатно, без задължения, и ще ти кажем 3 неща, които можеш да направиш веднага, за да спреш да си невидим.",
      cta: "Вземи безплатния анализ",
    },
    form: {
      badge: "Започни",
      titleBefore: "Попълни формата по-долу за твоите ",
      titleAccent: "безплатни корекции.",
      submit: "Изпрати",
      consent: GOOGLE_FREE_ANALYSIS_MARKETING_CONSENT,
    },
  },
  tipsCta: {
    badge: "Безплатни материали",
    title: "3 съвета за по-високо класиране в Google",
    description:
      "Гледай безплатното видео с първите три неща, които правим, когато започваме работа с локален бизнес - за да влезе в топ 3.",
    note: "Без технически знания. Без задължения.",
    cta: "Вземи 3 безплатни съвета",
  },
  analysisCta: {
    badge: "Безплатно",
    title: "Персонализиран анализ",
    description:
      "Вземи безплатно видео, в което анализираме твоя сайт и Google Business профил и ти показваме как можеш да започнеш да се класираш в топ 3.",
    cta: "Вземи безплатен анализ",
  },
  faq: {
    eyebrow: "Въпроси",
    title: "Често задавани въпроси",
    items: [
      {
        question: "Как знам, че наистина можете да гарантирате топ 3?",
        answer:
          "Правили сме това за десетки локални бизнеси - зъболекари, водопроводчици, адвокати, ресторанти и други. Поемаме само бизнеси, за които знаем, че можем да ги класираме. Преди да започнем, правим одит на пазара и продължаваме само ако сме сигурни, че можем да постигнем резултат. Ако не влезеш в топ 3 за 90 дни, продължаваме да работим безплатно, докато го постигнем.",
      },
      {
        question: "Колко всъщност ще ми струва това?",
        answer:
          "Цената е €190 на месец. Няма дългосрочни договори с обвързване. Можеш да спреш по всяко време, но повечето клиенти остават, защото резултатите говорят сами за себе си.",
      },
      {
        question: "Ще работи ли това за моя тип бизнес?",
        answer:
          "Ако си локален бизнес с физически обект или обслужваш клиенти в конкретен район - да. Системата работи за всеки локален бизнес, който клиентите търсят в Google заедно с града си. На разговора ще ти кажем директно, ако пазарът е твърде конкурентен или има нещо, което би попречило на класирането.",
      },
      {
        question: "Колко време отнема, докато видя резултати?",
        answer:
          "Повечето бизнеси виждат движение в класирането в рамките на 2–3 седмици. Ще забележиш, че се изкачваш в Google Maps. Гаранцията е топ 3 за 90 дни, но много го постигат по-рано. Веднъж в топ 3, телефонът започва да звъни по-регулярно.",
      },
      {
        question: "Колко време от мен изисква това?",
        answer:
          "Около 15 минути при старта - нужен ни е достъп до Google Business профила ти и малко информация за бизнеса. След това ние поемаме всичко - оптимизация, отзиви, публикации и видимост. Не трябва да пипаш нищо техническо.",
      },
      {
        question: "Какво става, ако не постигна резултат?",
        answer:
          "Ако не си в топ 3 след 90 дни, продължаваме да работим безплатно, докато го постигнем. Без формуляри, без досадни процеси. Или получаваш топ 3 класиране, или работим безплатно, докато стане.",
      },
    ],
  },
} as const;
