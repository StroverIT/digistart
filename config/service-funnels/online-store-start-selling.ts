import {
  ONLINE_STORE_OPTION_ID,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import { READY_STORE_PRICING } from "@/lib/data/ready-store-pricing";
import type { ServiceFunnelDefinition } from "@/config/service-funnels/types";

const STORE_MONTHLY = READY_STORE_PRICING.baseMonthly;
const META_ADS_BUDGET = 100;
const PACKAGE_TOTAL = 300;

export const ONLINE_STORE_START_SELLING_FUNNEL: ServiceFunnelDefinition = {
  id: "online-store-start-selling",
  serviceId: "ready-store",
  funnelSlug: "start-selling-online",
  adminLabel: "Искаш да продаваш онлайн?",
  sourcePage: "Онлайн магазин funnel (/services/online-store/start-selling-online)",
  analyticsCtaId: "online_store_funnel_checkout_submit",
  meta: {
    title: `Започни да продаваш онлайн – пакет от €${PACKAGE_TOTAL}`,
    description:
      "Най-евтиният и най-лесният старт за онлайн продажби. Готов магазин, плащания, куриери и Meta реклами – ти само качваш продуктите.",
    ogCoverKey: "onlineStore",
    ogAlt: "DigiStart – Старт на онлайн магазин",
  },
  metaLead: {
    contentName: "DigiStart - Старт онлайн магазин (funnel)",
    leadSource: "online_store_funnel",
  },
  hero: {
    title: "Искаш да продаваш онлайн? Супер.",
    subtitle: "Най-евтиният и най-лесният начин да пуснеш продажбите си в интернет.",
    description:
      "Без програмисти, без скъпи агенции – готов магазин, плащания и реклами. Ти се грижиш само за продуктите и изпращането.",
    ctaLabel: "Започни сега",
  },
  whoIsItFor: {
    title: "Животът, който искаш",
    subtitle: "Продажби онлайн – без да ставаш програмист или маркетинг експерт",
    items: [
      {
        title: "Поръчки идват, докато спиш или си в магазина",
        description:
          "Клиентите поръчват сами – денем, нощем, в почивните дни. Ти получаваш известие и подготвяш пратката.",
      },
      {
        title: "Професионален магазин без агенция и скъпи договори",
        description:
          "Изглеждаш сериозно пред клиентите от първия ден – с готов дизайн, плащания и доставка, без да плащаш хиляди наведнъж.",
      },
      {
        title: "Фокус върху продуктите – ние поемаме техническат част и рекламите",
        description:
          "Твоята работа е проста: качваш продуктите, опаковаш и изпращаш. Всичко останало – магазин, хостинг, реклами е наша грижа.",
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
        description: `Подготвяме рекламното съдържание за Facebook и Instagram и пускаме кампаниите с включения бюджет от €${META_ADS_BUDGET}.`,
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
      `€${META_ADS_BUDGET} бюджет за Meta реклами (Facebook и Instagram)`,
      "Безплатен хостинг и SSL сертификат",
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
      breakdownNote: `€${STORE_MONTHLY}/месец за онлайн магазина + €${META_ADS_BUDGET} за Meta реклами`,
      frequencyLabel: null,
    },
    ctaLabel: "Започни сега",
    planFeatures: [
      `Онлайн магазин за €${STORE_MONTHLY}/месец – създаваме и поддържаме всеки месец`,
      "Безплатно плащане с карта (Apple Pay и Google Pay)",
      "Безплатна интеграция със Спиди и Еконт",
      `€${META_ADS_BUDGET} бюджет за Meta реклами (Facebook и Instagram)`,
      "Безплатен хостинг и SSL сертификат",
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
        question: `Колко струва пакетът общо?`,
        answer: `Общата цена е €${PACKAGE_TOTAL} – €${STORE_MONTHLY}/месец за онлайн магазина и €${META_ADS_BUDGET} за Meta реклами (Facebook и Instagram). Включени са хостинг, поддръжка, плащане с карта и интеграция със Спиди и Еконт.`,
      },
      {
        question: `Какво значи €${META_ADS_BUDGET} за Meta реклами?`,
        answer: `В пакета е включен рекламен бюджет от €${META_ADS_BUDGET} за Facebook и Instagram кампании. Ние подготвяме съдържанието и пускаме рекламите – ти не се занимаваш с Ads Manager.`,
      },
      {
        question: "Какво трябва да направя аз?",
        answer:
          "Да поръчаш пакета, да качиш продуктите в магазина и при поръчка да опаковаш и изпратиш. Останалото – магазин, техника, реклами – е наша работа.",
      },
      {
        question: "Колко време отнема стартът?",
        answer:
          "След поръчката магазинът се настройва до 48 часа. След това качваш продуктите и пускаме рекламите.",
      },
    ],
  },
  features: {
    showCaseStudy: false,
    showProcessStepsSection: true,
    showProcessStepsInBooking: false,
    showHeroDescription: true,
  },
};
