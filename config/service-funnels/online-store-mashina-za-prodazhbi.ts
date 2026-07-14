import { ONLINE_STORE_SERVICE_ID } from "@/config/service-landing/online-store";
import type {
  SalesStagePasBlock,
  ServiceFunnelDefinition,
  ServiceFunnelWhoIsItFor,
} from "@/config/service-funnels/types";

const PAS_PROBLEM_IMAGE = "/funnel/online-store/start-selling-online/problem.png";
const PAS_AGITATE_IMAGE = "/funnel/online-store/start-selling-online/agitate.png";

const MASHINA_WHO_IS_IT_FOR: ServiceFunnelWhoIsItFor = {
  title: "Какво предлагаме",
  subtitle: "Три стълба, без които онлайн продажбите не работят",
  items: [
    {
      title: "Целева аудитория",
      description:
        "Определяме кой е Вашият идеален клиент и как да го достигнем. Ако не знаем на кого продаваме, губим продажби.",
    },
    {
      title: "Маркетингова стратегия",
      description:
        "Изграждаме ясен план как да Ви виждат и купуват.\n\nАко не знаем как да го представим правилно на правилните хора, губим продажби.",
    },
    {
      title: "Инструментите",
      description:
        "Онлайн магазин, сайтове, SEO оптимизация, реклами, социални мрежи и Google My Business. Всеки инструмент зависи от бизнеса Ви – избираме само това, което носи резултат.",
    },
  ],
};

function buildPasSection(problem: SalesStagePasBlock, agitate: SalesStagePasBlock): ServiceFunnelWhoIsItFor {
  return {
    title: "",
    subtitle: "",
    items: [
      {
        badge: "Проблем",
        title: problem.title,
        description: problem.description,
        image: PAS_PROBLEM_IMAGE,
        imageFirst: false,
      },
      {
        badge: "Натиск",
        title: agitate.title,
        description: agitate.description,
        image: PAS_AGITATE_IMAGE,
        imageFirst: true,
      },
    ],
  };
}

const MASHINA_SHARED = {
  serviceId: ONLINE_STORE_SERVICE_ID,
  analyticsCtaId: "online_store_mashina_za_prodazhbi_consultation_submit",
  hero: {
    title: "Не инструменти. Създаваме система за онлайн продажби",
    titleLead: "Не",
    ctaLabel: "Стартирайте процеса сега",
    video: {
      provider: "youtube" as const,
      youtubeId: "nefQSJ6FRxA",
      title: "DigiStart – Денонощна машина за продажби",
      thumbnailSrc: "/funnel/ако-не-ти-се-чеете(1080-1920).png",
      format: "short" as const,
    },
  },
  whoIsItFor: MASHINA_WHO_IS_IT_FOR,
  processSteps: {
    title: "Пътят към успеха",
    subtitle: "Пет ясни стъпки от интерес до съвместна работа",
    steps: [
      {
        title: "Имате интерес",
        description: "Запазвате безплатна консултация в удобно за Вас време.",
      },
      {
        title: "Среща за опознаване",
        description:
          "Опознаваме бранда и говорим за състоянието, в което се намирате в момента, къде искате да стигнете и как е възможно да стигнем до там заедно.",
      },
      {
        title: "Избор на пакет",
        description: "Пращаме Ви оферта и спрямо бюджета, който имате, започваме работа.",
      },
      {
        title: "Създаване на стратегия",
        description: "Според пакета създаваме стратегия за Вашите онлайн продажби.",
      },
      {
        title: "Стартиране на работа",
        description: "Стартиране на съвместна работа – Вие продавате, ние поемаме системата.",
      },
    ],
  },
  consultation: {
    promptTitle: "Готови ли сте да започнем?",
    promptCtaLabel: "Запазете безплатна консултация",
    formTitle: "Запазете 1 час консултация сега",
    description: "Нека обсъдим как да превърнем бизнеса Ви в денонощна машина за продажби.",
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
      notesLabel: "Какво искате да продавате онлайн?",
      notesPlaceholder: "Напр. handmade свещи, дрехи, хранителни продукти...",
      showOnSiteOption: true,
    },
  },
  faq: {
    title: "Често задавани въпроси",
    description: "Кратки отговори, преди да запазите час.",
    items: [
      {
        question: "Консултацията наистина ли е безплатна?",
        answer:
          "Да. Разговорът е без задължение – целта е да разберем дали можем да помогнем и да Ви дадем полезни насоки още на срещата.",
      },
      {
        question: "Ще ми продавате агресивно по време на разговора?",
        answer:
          "Не. Ще прегледаме бизнеса Ви, ще споделим конкретни наблюдения и само ако услугата ни пасва – ще Ви предложим следваща стъпка. Без натиск.",
      },
      {
        question: "Какво да подготвите преди срещата?",
        answer:
          "Достатъчно е да ни кажете какво продавате и какво искате да постигнете. Ако имате сайт или профили в социалните мрежи – споделете ги във формата.\n\nМоже да приготвите линкове към социалните мрежи и към онлайн магазина, ако имате.",
      },
      {
        question: "Работите ли само с нови бизнеси?",
        answer:
          "Не. Работим и с хора, които вече продават онлайн, но искат повече продажби. Важното е да търсим дългосрочно партньорство.",
      },
      {
        question: "Защо работите с лимитирани места?",
        answer:
          "Приемаме ограничен брой клиенти, за да гарантираме качество на всеки проект – с внимание към детайла и без компромис в отношението към Вас.",
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

export const ONLINE_STORE_MASHINA_ZA_PRODAZHBI_STARTING_FUNNEL: ServiceFunnelDefinition = {
  ...MASHINA_SHARED,
  id: "online-store-mashina-za-prodazhbi-starting",
  funnelSlug: "mashina-za-prodazhbi-iskam-da-prodavam",
  adminLabel: "Денонощна машина – Искам да продавам",
  audienceSegment: "starting",
  sourcePage:
    "Онлайн магазин funnel (/services/online-store/mashina-za-prodazhbi-iskam-da-prodavam)",
  meta: {
    title: "Денонощна машина за продажби – искате да започнете онлайн",
    description:
      "Искате да продавате онлайн, но не знаете откъде да започнете? Запазете безплатна 1-часова консултация и нека изградим система за продажби за Вашия бизнес.",
    ogCoverKey: "homeOnline",
    ogAlt: "DigiStart – Денонощна машина за продажби (искам да продавам)",
    robots: { index: false, follow: true },
  },
  metaLead: {
    contentName: "DigiStart - Денонощна машина за продажби (искам да продавам)",
    leadSource: "online_store_mashina_za_prodazhbi_starting",
  },
  metaPageView: {
    contentName: "DigiStart - Денонощна машина за продажби (искам да продавам)",
    viewSource: "online_store_mashina_za_prodazhbi_starting",
  },
  pasSection: buildPasSection(
    {
      title: "Искате да започнете, но не знаете как",
      description:
        "Не знаете как да го направите, а агенциите Ви искат хиляди евро, договори и Ви говорят на техния си език. При нас не е така.",
    },
    {
      title: "Всеки ден без действие е загубена възможност",
      description:
        "Не сте сигурни дали сега е правилният момент? Всеки ден, в който не предлагате продукта си онлайн, губите клиенти и възможности.",
    },
  ),
};

export const ONLINE_STORE_MASHINA_ZA_PRODAZHBI_SELLING_FUNNEL: ServiceFunnelDefinition = {
  ...MASHINA_SHARED,
  id: "online-store-mashina-za-prodazhbi-selling",
  funnelSlug: "mashina-za-prodazhbi-veche-prodavam",
  adminLabel: "Денонощна машина – Вече продавам",
  audienceSegment: "selling",
  sourcePage:
    "Онлайн магазин funnel (/services/online-store/mashina-za-prodazhbi-veche-prodavam)",
  meta: {
    title: "Денонощна машина за продажби – вече продавате онлайн",
    description:
      "Вече продавате онлайн, но искате повече оборот? Запазете безплатна 1-часова консултация и нека надградим системата Ви за продажби.",
    ogCoverKey: "homeOnline",
    ogAlt: "DigiStart – Денонощна машина за продажби (вече продавам)",
    robots: { index: false, follow: true },
  },
  metaLead: {
    contentName: "DigiStart - Денонощна машина за продажби (вече продавам)",
    leadSource: "online_store_mashina_za_prodazhbi_selling",
  },
  metaPageView: {
    contentName: "DigiStart - Денонощна машина за продажби (вече продавам)",
    viewSource: "online_store_mashina_za_prodazhbi_selling",
  },
  pasSection: buildPasSection(
    {
      title: "Платформата Ви задържа",
      description:
        "Използвате готова платформа? Но не разбирате от дизайн, програмиране и/или маркетинг? Всяка техническа част е едно голямо препятствие? Супер – ние сме тук да помогнем с всичко. Винаги сме до Вас и Ви предлагаме нови идеи, които са доказани на пазара и продават.",
    },
    {
      title: "Всеки иска повече оборот",
      description:
        "Свикнали сте с платформата или оборотът Ви е достатъчен? Хмм, нека не се лъжем. Всеки иска повече и повече оборот, а платформата е просто един инструмент, с който успяваме да продаваме.",
    },
  ),
};
