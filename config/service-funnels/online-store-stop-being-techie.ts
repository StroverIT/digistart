import {
  ONLINE_STORE_CONSULTATION,
  ONLINE_STORE_LANDING,
  ONLINE_STORE_SERVICE_ID,
} from "@/config/service-landing/online-store";
import { formatEuroPrice, READY_STORE_PRICING } from "@/lib/data/ready-store-pricing";
import type { ServiceFunnelDefinition } from "@/config/service-funnels/types";

const basePriceLabel = formatEuroPrice(READY_STORE_PRICING.baseMonthly);

export const ONLINE_STORE_STOP_BEING_TECHIE_FUNNEL: ServiceFunnelDefinition = {
  id: "online-store-stop-being-techie",
  serviceId: ONLINE_STORE_SERVICE_ID,
  funnelSlug: "stop-being-techie",
  layout: "ready-store-v2",
  defaultSlotCapacity: 5,
  adminLabel: "Спри да бъдеш техничар",
  sourcePage: "Онлайн магазин funnel (/services/online-store/stop-being-techie)",
  analyticsCtaId: "online_store_stop_being_techie_buy_add_to_cart",
  meta: {
    title: "Спри да бъдеш техничар – онлайн магазин без техническа работа",
    description: `Онлайн магазин за продавачи в Instagram, Facebook и OLX – от ${basePriceLabel}/мес. Безплатна миграция, човешка поддръжка 9:00–22:00 и 14 дни безплатен тест.`,
    ogCoverKey: "onlineStore",
    ogAlt: "DigiStart – Спри да бъдеш техничар",
  },
  metaLead: {
    contentName: "DigiStart - Спри да бъдеш техничар (funnel)",
    leadSource: "online_store_stop_being_techie",
  },
  metaPageView: {
    contentName: "DigiStart - Спри да бъдеш техничар (funnel)",
    viewSource: "online_store_stop_being_techie",
  },
  readyStoreV2: {
    hero: {
      eyebrow: "Не платформа. Персонализиран онлайн магазин",
      title: "Спри да бъдеш техничар",
      subtitle:
        "Работата не ти е да бъдеш дизайнер, програмист и маркетолог, а да продаваш продукти онлайн.",
      includedLabel: "Включено",
      includedItems: [
        {
          title: "Безплатна миграция",
          hint: "От Shopify, WooCommerce и WordPress",
        },
        {
          title: "Нищо техническо",
          hint: "Твоята грижа е само да качваш продукти и да ги изпращаш",
        },
        {
          title: "Винаги до теб",
          hint: "Всеки ден сме на линия от 9:00 до 22:00",
        },
        {
          title: "Всичко нужно",
          hint: "Ако липсва нещо, ще го добавим за теб",
        },
      ],
      ctaLabel: "Започни безплатно",
      ctaHint: "Пробният период е 14 дни.",
    },
    whoIsItFor: {
      title: "Персонализицация",
      subtitle:
        "Копираме сегашният ти магазин и надграждаме на него, спрямо твоите нужни и твоите цели",
      items: [
        {
          badge: "Проблем",
          title:
            "С Shopify, WooCommerce, CloudCart и WordPress ставаш дизайнер, програмист и IT поддръжка",
          description:
            "Плъгини, теми, актуализации, плащания, куриери, скорост на сайта – всичко е на теб. Един проблем с касата или доставката и продажбите спират, докато ти ровиш в настройки.",
          image: "/funnel/online-store/start-selling-online/problem.png",
          imageFirst: false,
        },
        {
          badge: "Натиск",
          title: "Докато оправяш платформата, конкурентите взимат клиентите ти",
          description:
            "Всяка седмица без работеща система е поръчки, изгубени в чат. Клиентът не чака да оправиш WooCommerce или да намериш правилния Shopify app – просто купува от другаде.",
          image: "/funnel/online-store/start-selling-online/agitate.png",
          imageFirst: true,
        },
        {
          badge: "Решение",
          title: "Ние поемаме техническото – ти качваш продукти и изпращаш",
          description:
            "Безплатна миграция от Shopify, WooCommerce, WordPress и CloudCart. Адаптираме магазина, плащанията и доставката – ти имаш човек на линия всеки ден от 9:00 до 22:00.\n\nАко липсва нещо, го добавяме. Твоята работа е да продаваш.",
          image: "/funnel/online-store/start-selling-online/solution.png",
          imageFirst: false,
        },
      ],
    },
    competitorPicker: {
      enabled: true,
      title: "От коя платформа идваш?",
      subtitle: "Помогни ни да знаем откъде мигрираш",
    },
  },
  faq: {
    ...ONLINE_STORE_LANDING.faq,
    items: ONLINE_STORE_LANDING.faq.items
      .filter((item) => item.question !== "Получавам ли просто един готов шаблон?")
      .map((item) => {
        if (item.question === "За кого е подходяща услугата?") {
          return {
            ...item,
            answer:
              "За търговци, които вече продават успешно в {{platform}}, но губят часове в техническа работа (настройки, дизайн, разполжения и т.н.). Ние изграждаме системата, за да може да се фокусираш върху растежа.",
          };
        }
        return { ...item };
      }),
  },
  consultation: {
    promptTitle: ONLINE_STORE_CONSULTATION.promptTitle,
    promptCtaLabel: ONLINE_STORE_CONSULTATION.promptCtaLabel,
    formTitle: ONLINE_STORE_CONSULTATION.formTitle,
    description: ONLINE_STORE_CONSULTATION.description,
    analyticsCtaId: "online_store_stop_being_techie_consultation_submit",
    metaLead: {
      contentName: "DigiStart - Безплатна консултация (спри да бъдеш техничар)",
      leadSource: "online_store_stop_being_techie_consultation",
    },
    booking: ONLINE_STORE_CONSULTATION.booking,
  },
};
