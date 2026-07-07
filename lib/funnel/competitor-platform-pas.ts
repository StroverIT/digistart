import type { ServiceFunnelWhoIsItFor } from "@/config/service-funnels/types";
import type { CompetitorPlatform, CompetitorPlatformAnswer } from "@/lib/funnel/competitor-platform";
import { personalizeCompetitorCopy } from "@/lib/funnel/competitor-platform-personalization";

export type CompetitorPlatformPasBlock = {
  title: string;
  description: string;
};

export type CompetitorPlatformPasContent = {
  problem: CompetitorPlatformPasBlock;
  agitate: CompetitorPlatformPasBlock;
  solution: CompetitorPlatformPasBlock;
  specificPains: string[];
  waitingCosts: string[];
  migrationHooks: string[];
  oneLinerPain: string;
  faqObjection: string;
  faqAnswer: string;
};

const PAS_BADGES = ["Проблем", "Натиск", "Решение"] as const;

export const COMPETITOR_PLATFORM_PAS: Record<
  Exclude<CompetitorPlatform, "other">,
  CompetitorPlatformPasContent
> = {
  shopify: {
    problem: {
      title: "Скрити такси и хаос от приложения",
      description:
        "Плащаш базов абонамент, но сметката набъбва експанзивно заради 15+ скъпи приложения и 2% такса за външни плащания. Чекаутът ти е заключен и се бориш с месеци да добавиш спецификите на българските куриери.",
    },
    agitate: {
      title: "Губиш марж, докато търсиш workarounds",
      description:
        "Докато се опитваш сам да разбереш кое приложение бави зареждането, плащаш за трафик, който отпада. Всяка секунда забавяне и всеки опит да излъжеш системата за наложен платеж ти струва реални продажби и пропуснати ползи.",
    },
    solution: {
      title: "Експертна намеса вместо технически главоболия",
      description:
        "DigiStart поема пълната техническа поддръжка от 09:00 до 22:00 ч. Ние одитваме и премахваме ненужните приложения, настройваме локалните интеграции и спираме изтичането на маржа ти, без ти да пипаш код.",
    },
    specificPains: [
      "2% наказателна такса при ползване на локален виртуален ПОС",
      "Месечни абонаменти за бавни apps, базирани на обема поръчки",
      "Невъзможност за къстъмизация на checkout процеса за локалния пазар",
    ],
    waitingCosts: [
      "Губиш между 1.0% и 2.0% от оборота си в излишни такси",
      "Плащаш десетки долари за припокриващи се приложения",
      "Клиентите изоставят колички заради липсващи методи за доставка",
    ],
    migrationHooks: [
      "Безпроблемна миграция към по-рентабилна екосистема без скрити такси",
      "Цялостно реструктуриране на разходите за софтуер",
    ],
    oneLinerPain:
      "Спри да подаряваш маржа си на Shopify и да губиш часове в настройка на несъвместими приложения.",
    faqObjection: "Свикнал съм със системата, защо да плащам на външна агенция?",
    faqAnswer:
      "Защото времето ти струва повече от техническата поддръжка. DigiStart елиминира техническите пречки и оптимизира разходите ти, за да можеш да се фокусираш изцяло върху продажбите и маркетинга.",
  },
  woocommerce: {
    problem: {
      title: "Технически дълг и счупен чекаут",
      description:
        "Базата ти данни е препълнена с остатъци от стари разширения, а сайтът става все по-бавен с всяка нова поръчка. Конфликтите между кеширащите системи и логистичните модули за Еконт и Спиди са ежедневие.",
    },
    agitate: {
      title: "Количката зарежда безкрайно, парите изтичат",
      description:
        "Един грешен ъпдейт срутва процеса на плащане в най-натоварения час. Докато чакаш фрийлансър да намери проблема в логовете, рекламният ти бюджет изгаря напълно напразно.",
    },
    solution: {
      title: "Безопасни ъпдейти и 24/7 стабилност",
      description:
        "С DigiStart получаваш проактивна поддръжка от 09:00 до 22:00 ч. Тестваме всяко обновление в сигурна среда и следим сървъра ти непрекъснато, за да нямаш нито една изгубена транзакция.",
    },
    specificPains: [
      "Раздута база данни (wp_options) и бавен административен панел",
      "Счупен чекаут при несъвместимост между куриерски плъгини и кеш",
      "Срив на сайта при автоматични обновления на ядрото",
    ],
    waitingCosts: [
      "Директни финансови загуби от изоставени колички",
      "Спад в SEO позициите заради бавно зареждане",
      "Разходи за спешна техническа помощ на висока часова ставка",
    ],
    migrationHooks: [
      "Миграция към високопроизводителен хостинг и оптимизирана база данни (HPOS)",
      "Изчистване на всички излишни плъгини чрез custom програмиране",
    ],
    oneLinerPain: "Спри да трепериш при всеки ъпдейт и да губиш поръчки заради бавен чекаут.",
    faqObjection: "Мога да си ъпдейтвам плъгините сам, става буквално с един клик.",
    faqAnswer:
      "Един клик често води до бял екран и неработещ метод за доставка. Ние правим пълни бекъпи и тестваме всичко в изолирана среда, за да гарантираме 100% ъптайм.",
  },
  cloudcart: {
    problem: {
      title: "Данък върху растежа и затворена система",
      description:
        "Плащаш по-висок абонамент само защото си увеличил оборота си, без да получаваш нови ресурси. Лишен си от контрол върху кода и всяка специфична функционалност изисква месеци чакане.",
    },
    agitate: {
      title: "Заклещен на сергия под наем",
      description:
        "Докато конкурентите ти автоматизират продажбите си в чужбина, ти чакаш със седмици за елементарна доработка на огромна цена. Международната ти експанзия е блокирана от лимитите на платформата.",
    },
    solution: {
      title: "Свобода за бизнеса без технически стрес",
      description:
        "Ние от DigiStart поемаме комуникацията с поддръжката и техническата настройка от 09:00 до 22:00 ч. А когато платформата ти отеснее окончателно, менажираме пълна и безопасна миграция с нулева загуба на SEO.",
    },
    specificPains: [
      "Ценообразуване, базирано директно на реализирания оборот",
      "Липса на свобода за къстъм разработки и високи цени на час (50-100 EUR)",
      "Слаби инструменти за международна експанзия и многоезичност",
    ],
    waitingCosts: [
      "Плащаш по-високи месечни такси заради изкуствени лимити",
      "Пропускаш пазарен дял в чужбина заради липса на автоматизация",
      "Губиш време в комуникация с бавен съпорт",
    ],
    migrationHooks: [
      "Цялостна миграция на каталог, атрибути и клиенти към независима платформа",
      "Запазване на всички SEO URL адреси със 100% точност",
    ],
    oneLinerPain:
      "Спри да плащаш данък върху успеха си и да чакаш със седмици за базова техническа помощ.",
    faqObjection: "Платформата има собствен съпорт, защо ми е външна фирма?",
    faqAnswer:
      "Защото за всяка специфична промяна чакаш дълго и си изцяло зависим от техните приоритети. DigiStart ти осигурява гъвкавост и бързи решения извън стандартните им рамки.",
  },
  wordpress: {
    problem: {
      title: "Уязвимости и хаос при поддръжката",
      description:
        "Ядрото, темата и десетките разширения постоянно изискват обслужване. Всеки пропуснат ъпдейт те прави мишена за хакерски атаки, а всяко прибързано обновяване чупи визуалния изглед на сайта.",
    },
    agitate: {
      title: "Сайтът е офлайн точно преди кампания",
      description:
        "Откриваш белия екран на смъртта точно когато пускаш рекламите си. Опитваш се да върнеш бекъп, който се оказва непълен, и губиш часове в отстраняване на зловреден код, вместо да обслужваш запитвания.",
    },
    solution: {
      title: "Непробиваема защита и пълно спокойствие",
      description:
        "С DigiStart получаваш сигурна дигитална крепост. Правим ежедневни бекъпи, мониторинг на сигурността и контролирани ъпдейти с човешка проверка от 09:00 до 22:00 ч., без ти да пипаш нищо.",
    },
    specificPains: [
      "Риск от хакерски атаки заради остарели версии на плъгини",
      "Бял екран на смъртта (WSOD) поради конфликт в PHP версиите",
      "Бавно зареждане заради неоптимизиран код и спам коментари",
    ],
    waitingCosts: [
      "Загуба на доверие у клиентите и спад в позициите в Google",
      "Скъпоструващи услуги за изчистване на заразен сайт",
      "Пълна загуба на данни при липса на правилен архив",
    ],
    migrationHooks: [
      "Изчистване на техническия дълг и прехвърляне към управляван сървър",
      "Смяна на тежки билдери с лек, оптимизиран код",
    ],
    oneLinerPain: "Спри да бъдеш администратор на сайт и стани отново собственик на бизнес.",
    faqObjection: "Сайтът ми работи от години без проблеми, защо да плащам сега?",
    faqAnswer:
      "Без активна поддръжка трупаш скрит технически дълг и уязвимости. Ние поемаме отговорността за здравето на сайта, за да предотвратим срива преди изобщо да се е случил.",
  },
};

export function getCompetitorPlatformPas(
  platform: CompetitorPlatform,
): CompetitorPlatformPasContent | null {
  if (platform === "other") return null;
  return COMPETITOR_PLATFORM_PAS[platform];
}

export function resolveCompetitorPlatformWhoIsItFor(
  base: ServiceFunnelWhoIsItFor,
  answer: CompetitorPlatformAnswer | null,
): ServiceFunnelWhoIsItFor {
  if (!answer) return base;

  if (answer.platform === "other") {
    return {
      ...base,
      title: personalizeCompetitorCopy(base.title, answer),
      subtitle: personalizeCompetitorCopy(base.subtitle, answer),
      items: base.items.map((item) => ({
        ...item,
        title: personalizeCompetitorCopy(item.title, answer),
        description: personalizeCompetitorCopy(item.description, answer),
      })),
    };
  }

  const pas = COMPETITOR_PLATFORM_PAS[answer.platform];
  if (!pas) return base;

  const pasBlocks = [pas.problem, pas.agitate, pas.solution];

  return {
    ...base,
    items: base.items.map((item, index) => {
      const block = pasBlocks[index];
      if (!block) return item;

      return {
        ...item,
        badge: PAS_BADGES[index],
        title: block.title,
        description: block.description,
      };
    }),
  };
}

export function getCompetitorPlatformFaqItem(
  answer: CompetitorPlatformAnswer | null,
): { question: string; answer: string } | null {
  if (!answer || answer.platform === "other") return null;

  const pas = COMPETITOR_PLATFORM_PAS[answer.platform];
  if (!pas) return null;

  return {
    question: pas.faqObjection,
    answer: pas.faqAnswer,
  };
}

export function getCompetitorPlatformOneLinerPain(
  answer: CompetitorPlatformAnswer | null,
): string | null {
  if (!answer || answer.platform === "other") return null;
  return COMPETITOR_PLATFORM_PAS[answer.platform]?.oneLinerPain ?? null;
}
