import { ONLINE_STORE_SERVICE_ID } from "@/config/service-landing/online-store";
import type { ServiceFunnelDefinition } from "@/config/service-funnels/types";

export const ONLINE_STORE_MASHINA_ZA_PRODAZHBI_FUNNEL: ServiceFunnelDefinition = {
  id: "online-store-mashina-za-prodazhbi",
  serviceId: ONLINE_STORE_SERVICE_ID,
  funnelSlug: "mashina-za-prodazhbi",
  adminLabel: "Денонощна машина за продажби",
  sourcePage: "Онлайн магазин funnel (/services/online-store/mashina-za-prodazhbi)",
  analyticsCtaId: "online_store_mashina_za_prodazhbi_consultation_submit",
  meta: {
    title: "Денонощна машина за продажби – безплатна консултация",
    description:
      "Не просто онлайн магазин – система, която продава денонощно. Запази безплатна 1-часова консултация и разберем как да изградим машина за продажби за твоя бизнес.",
    ogCoverKey: "onlineStore",
    ogAlt: "DigiStart – Денонощна машина за продажби",
    robots: { index: false, follow: true },
  },
  metaLead: {
    contentName: "DigiStart - Денонощна машина за продажби (funnel)",
    leadSource: "online_store_mashina_za_prodazhbi",
  },
  metaPageView: {
    contentName: "DigiStart - Денонощна машина за продажби (funnel)",
    viewSource: "online_store_mashina_za_prodazhbi",
  },
  hero: {
    title: "Не инструменти. Създаваме система за онлайн продажби",
    titleLead: "Не",
    ctaLabel: "Стартирай процеса сега",
    video: {
      provider: "google-drive",
      fileId: "1VeV2RJqhtWhxzY7iOZc6RGY9big9aflY",
      title: "DigiStart – Денонощна машина за продажби",
      thumbnailSrc: "/funnel/ако-не-ти-се-чеете.png",
      format: "standard",
    },
  },
  salesStagePicker: {
    title: "Какво правиш в момента",
    options: [
      { id: "starting", label: "Искам да продавам" },
      { id: "selling", label: "Вече продавам" },
    ],
    paths: {
      starting: {
        problem: {
          title: "Искаш да започнеш, но не знаеш как",
          description:
            "Не знаеш как да го направиш, а агенциите ти искат хиляди евро, договори и ти говорят на техния си език. При нас не е така.",
        },
        agitate: {
          title: "Всеки ден без действие е загубена възможност",
          description:
            "Не си сигурен дали сега е правилният момент? Всеки ден, в който не предлагаш продукта си онлайн, губиш клиенти и възможности.",
        },
      },
      selling: {
        problem: {
          title: "Платформата те задържа",
          description:
            "Използваш готова платформа? Но не разбираш от дизайн, програмиране и/или маркетинг? Всяка техническа част е едно голямо препятствие? Супер – ние сме тук да помогнем с всичко. Винаги сме до теб и ти предлагаме нови идеи, които са доказани на пазара и продават.",
        },
        agitate: {
          title: "Всеки иска повече оборот",
          description:
            "Свикнал си с платформата или оборотът ти е достатъчен? Хмм, нека не се лъжем. Всеки иска повече и повече оборот, а платформата е просто един инструмент, с който успяваме да продаваме.",
        },
      },
    },
  },
  whoIsItFor: {
    title: "Какво предлагаме",
    subtitle: "Три стълба, без които онлайн продажбите не работят",
    items: [
      {
        title: "Целева аудитория",
        description:
          "Ако не знаем на кого продаваме, губим продажби. Определяме кой е твоят идеален клиент и как да го достигнем.",
      },
      {
        title: "Маркетингова стратегия",
        description:
          "Ако не знаем как да го представим правилно на правилните хора, губим продажби. Изграждаме ясен план как да те виждат и купуват.",
      },
      {
        title: "Инструментите",
        description:
          "Онлайн магазин, сайтове, реклами, социални мрежи и Google My Business. Всеки инструмент зависи от бизнеса Ви – избираме само това, което носи резултат.",
      },
    ],
  },
  processSteps: {
    title: "Пътят към успеха",
    subtitle: "Пет ясни стъпки от интерес до съвместна работа",
    steps: [
      {
        title: "Имате интерес",
        description: "Запазвате безплатна консултация и ни казвате какво искате да постигнете.",
      },
      {
        title: "Среща за опознаване",
        description:
          "Опознаваме бранда и говорим за състоянието, в което се намирате в момента, къде искате да стигнете и как е възможно да стигнем до там заедно.",
      },
      {
        title: "Избор на пакет",
        description:
          "Пращаме Ви оферта и спрямо бюджета, който имате, започваме работа.",
      },
      {
        title: "Създаване на стратегия",
        description: "Според пакета създаваме стратегия за вашите онлайн продажби.",
      },
      {
        title: "Стартиране на работа",
        description: "Стартиране на съвместна работа – вие продавате, ние поемаме системата.",
      },
    ],
  },
  consultation: {
    promptTitle: "Готов ли си да започнем?",
    promptCtaLabel: "Запази безплатна консултация",
    formTitle: "Запази 1 час консултация сега",
    description: "Нека обсъдим как да превърнем бизнеса ти в денонощна машина за продажби.",
    analyticsCtaId: "online_store_mashina_za_prodazhbi_consultation_submit",
    metaLead: {
      contentName: "DigiStart - Безплатна консултация (денонощна машина за продажби)",
      leadSource: "online_store_mashina_za_prodazhbi_consultation",
    },
    pricing: {
      originalPrice: 138,
      priceLabel: "безплатно",
    },
    booking: {
      notesLabel: "Какво искаш да продаваш онлайн?",
      notesPlaceholder: "Напр. handmade свещи, дрехи, хранителни продукти...",
      showOnSiteOption: true,
    },
  },
  faq: {
    title: "Често задавани въпроси",
    description: "Кратки отговори, преди да запазиш час.",
    items: [
      {
        question: "Консултацията наистина ли е безплатна?",
        answer:
          "Да. Разговорът е без задължение – целта е да разберем дали можем да помогнем и да ти дадем полезни насоки още на срещата.",
      },
      {
        question: "Ще ми продавате агресивно по време на разговора?",
        answer:
          "Не. Ще прегледаме бизнеса ти, ще споделим конкретни наблюдения и само ако услугата ни пасва – ще ти предложим следваща стъпка. Без натиск.",
      },
      {
        question: "Какво да подготвя преди срещата?",
        answer:
          "Достатъчно е да ни кажеш какво продаваш и какво искаш да постигнеш. Ако имаш сайт или профили в социалните мрежи – сподели ги във формата.",
      },
      {
        question: "Работите ли само с нови бизнеси?",
        answer:
          "Не. Работим и с хора, които вече продават онлайн, но искат повече продажби. Важното е да търсим дългосрочно партньорство.",
      },
    ],
  },
  features: {
    showCaseStudy: false,
    showHeroGoogleReviews: false,
    showResultsSection: true,
    showResultsAfterProcess: true,
    consultationOnlyEnd: true,
    hideDoneForYouSection: true,
    showProcessStepsSection: true,
    showProcessStepsInBooking: false,
  },
};
