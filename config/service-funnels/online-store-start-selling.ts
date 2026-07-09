import {
  ONLINE_STORE_OPTION_ID,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import { READY_STORE_PRICING } from "@/lib/data/ready-store-pricing";
import type { ServiceFunnelDefinition } from "@/config/service-funnels/types";

const STORE_MONTHLY = READY_STORE_PRICING.baseMonthly;
const META_ADS_BUDGET = 100;
const PACKAGE_TOTAL = 400;
const AD_SETUP_FEE = PACKAGE_TOTAL - STORE_MONTHLY;

export const ONLINE_STORE_START_SELLING_FUNNEL: ServiceFunnelDefinition = {
  id: "online-store-start-selling",
  serviceId: "ready-store",
  funnelSlug: "start-selling-online",
  adminLabel: "Искаш да продаваш онлайн?",
  sourcePage: "Онлайн магазин funnel (/services/online-store/start-selling-online)",
  analyticsCtaId: "online_store_funnel_checkout_submit",
  meta: {
    title: `Започни да продаваш онлайн – от €${PACKAGE_TOTAL}/месец`,
    description:
      "Най-евтиният и най-лесният старт за онлайн продажби. Готов магазин, плащания, куриери и Meta реклами – ти само качваш продуктите.",
    ogCoverKey: "onlineStore",
    ogAlt: "DigiStart – Старт на онлайн магазин",
  },
  metaLead: {
    contentName: "DigiStart - Старт онлайн магазин (funnel)",
    leadSource: "online_store_funnel",
  },
  metaPageView: {
    contentName: "DigiStart - Старт онлайн магазин (funnel)",
    viewSource: "online_store_funnel",
  },
  hero: {
    title: "Искаш да продаваш онлайн? Супер.",
    subtitle: "Най-евтиният и най-лесният начин да пуснеш продажбите си в интернет.",
    ctaLabel: "Започни сега",
    video: {
      provider: "google-drive",
      fileId: "1VeV2RJqhtWhxzY7iOZc6RGY9big9aflY",
      title: "DigiStart – Започни да продаваш онлайн",
      thumbnailSrc: "/dont-read-thumbnail.png",
      format: "short",
    },
  },
  whoIsItFor: {
    title: "Защо идеята ти още не продава онлайн?",
    subtitle:
      "Имаш продукт, който си струва – но без система оставаш заклечен в съобщения и отлагане.",
    items: [
      {
        badge: "Проблем",
        title: "За да продаваш онлайн, трябва да разбираш от дизайн, маркетинг и техника",
        description:
          "Искаш собствен магазин, но не знаеш откъде да започнеш – платформа, плащания, куриери, реклами. Всичко изглежда сложно и скъпо, още преди първата поръчка.",
        image: "/funnel/online-store/start-selling-online/problem.png",
        imageFirst: false,
      },
      {
        badge: "Натиск",
        title: "Докато чакаш, някой друг вече продава",
        description:
          "В твоята ниша вече има хора с онлайн магазин. Всяка седмица без действие е клиент, който отива при тях. Печели този, който е първи – не задължително този с най-добрата идея.",
        image: "/funnel/online-store/start-selling-online/agitate.png",
        imageFirst: true,
      },
      {
        badge: "Решение",
        title: "Ние правим всичко техническо – ти се фокусираш върху продукта",
        description:
          "Създаваме и поддържаме магазина ти – дизайн, плащания, доставка, реклами.\n\nИмаш интегриран чат с нас: не те пускаме сами, следим как върви и даваме обратна връзка, за да продаваш по-добре.",
        image: "/funnel/online-store/start-selling-online/solution.png",
        imageFirst: false,
      },
    ],
  },
  processSteps: {
    title: "Как го правим",
    subtitle: "Четири ясни стъпки до първата онлайн поръчка",
    steps: [
      {
        title: "Поръчваш пакета",
        description:
          "Избираш стартовия пакет и плащаш онлайн. Без консултации и без чакане – започваме веднага.",
      },
      {
        title: "Създаваме магазина",
        description:
          "Настройваме готовия онлайн магазин – плащане с карта, Спиди и Еконт, хостинг и SSL. До 48 часа.",
      },
      {
        title: "Пускаме Meta рекламите",
        description:
          "Подготвяме рекламното съдържание за Facebook и Instagram и пускаме кампаниите. Бюджетът за реклами се плаща отделно директно на Meta.",
      },
      {
        title: "Ти качваш и изпращаш",
        description:
          "Добавяш продуктите си в магазина. При поръчка – опаковаш и предаваш на куриер. Ние поддържаме останалото.",
      },
    ],
  },
  doneForYou: {
    title: "Пакетът за старт",
    description:
      "Всичко необходимо за първите онлайн продажби – на едно място, на цена, която не те разорява преди първата поръчка.",
    items: [
      `Онлайн магазин за €${STORE_MONTHLY}/месец – създаваме го и го поддържаме всеки месец`,
      "Безплатно плащане с карта (Apple Pay и Google Pay)",
      "Безплатна интеграция със Спиди и Еконт",
      "Създаване и пускане на Meta реклами (Facebook и Instagram)",
      "Ние създаваме кампанията",
      "Безплатен хостинг и SSL сертификат",
      "Безплатно създаване на общи условия, политика за лични данни и политика за бисквитки",
      "Интегриран чат – винаги сме до теб при въпроси",
      "Ние създаваме съдържанието за рекламите – ти само качваш продуктите и ги изпращаш",
      "Настройка до 48 часа",
    ],
  },
  checkout: {
    header: "Готов ли си за продажби?",
    basePackageLabel: "Какво включва?",
    pricing: {
      total: PACKAGE_TOTAL,
      breakdownNote: `€${STORE_MONTHLY}/месец за онлайн магазина + €${AD_SETUP_FEE}/месец за реклами`,
      frequencyLabel: "/месец",
    },
    ctaLabel: "Започни сега",
    planFeatures: [
      `Онлайн магазин за €${STORE_MONTHLY}/месец – създаваме и поддържаме всеки месец`,
      "Безплатно плащане с карта (Apple Pay и Google Pay)",
      "Безплатна интеграция със Спиди и Еконт",
      "Създаване и пускане на Meta реклами (Facebook и Instagram)",
      "Ние създаваме кампанията",
      "Безплатен хостинг и SSL сертификат",
      "Безплатно създаване на общи условия, политика за лични данни и политика за бисквитки",
      "Интегриран чат – винаги сме до теб при въпроси",
      "Ние създаваме съдържанието за рекламите",
      "Настройка до 48 часа",
    ],
    items: [
      {
        serviceId: ONLINE_STORE_SERVICE_ID,
        optionId: ONLINE_STORE_OPTION_ID,
        upsells: [],
      },
    ],
  },
  consultation: {
    promptTitle: "Не си сигурен?",
    promptCtaLabel: "Нека поговорим",
    formTitle: "Запиши безплатна консултация",
    description: "Нека обсъдим всичко което те притеснява за да имаш плавен старт",
    analyticsCtaId: "online_store_funnel_consultation_submit",
    metaLead: {
      contentName: "DigiStart - Безплатна консултация (онлайн магазин funnel)",
      leadSource: "online_store_funnel_consultation",
    },
    booking: {
      notesLabel: "Какво искаш да продаваш онлайн?",
      notesPlaceholder: "Напр. handmade свещи, дрехи, хранителни продукти...",
      showOnSiteOption: true,
    },
  },
  faq: {
    title: "Често задавани въпроси",
    description: "Кратки отговори, преди да започнеш.",
    items: [
      {
        question: "За какво плащам?",
        answer: `Месечният абонамент е €${PACKAGE_TOTAL}: €${STORE_MONTHLY} за онлайн магазина и €${AD_SETUP_FEE} за създаване и управление на реклами. Включени са хостинг, поддръжка, плащане с карта и интеграция със Спиди и Еконт. Бюджетът за реклами не е включен – плащаш го отделно директно на Meta.`,
      },
      {
        question: "Бюджета за реклами включен ли е в цената?",
        answer: `Не, бюджетът за реклами не е включен в цената – плащаш го директно на Meta (Facebook и Instagram). Препоръчваме старт от €${META_ADS_BUDGET}, което обикновено е достатъчно за първоначален тест на пазара. Ако искаш да тестваш повече продукти, може да вдигнеш бюджета – но най-добре е да се фокусираш върху най-печелившите.`,
      },
      {
        question: "Какво трябва да направя аз?",
        answer:
          "Само се настройва магазинът (5–10 минути), след което трябва да добавиш продуктите през админ панела. Изпращането на продуктите все пак остава твоя отговорност.",
      },
      {
        question: "Колко време отнема стартът?",
        answer:
          "След настройването на магазина (5–10 минути) започваме разработката и отнема до 48 часа. След като качиш нужните продукти за продажба, създаваме рекламите и ги пускаме.",
      },
    ],
  },
  features: {
    showCaseStudy: false,
    showResultsSection: true,
    showProcessStepsSection: true,
    showProcessStepsInBooking: false,
  },
};
