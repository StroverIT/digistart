export const TARGET_AUDIENCES_PAGE_PATH = "/target-audiences" as const;
export const TARGET_AUDIENCES_SOURCE_DEFAULT = "target-audiences" as const;

export type TargetAudienceUrgency = "today" | "tomorrow" | "few_weeks";

export const TARGET_AUDIENCES_URGENCY_OPTIONS: {
  value: TargetAudienceUrgency;
  label: string;
}[] = [
  { value: "today", label: "Днес" },
  { value: "tomorrow", label: "Утре" },
  { value: "few_weeks", label: "След няколко седмици" },
];

export function getUrgencyLabel(value: string) {
  return TARGET_AUDIENCES_URGENCY_OPTIONS.find((entry) => entry.value === value)?.label ?? value;
}

export const targetAudiencesFormFields = {
  name: "Две имена",
  email: "Имейл",
  phone: "Телефонен номер",
  website: "Уебсайт или онлайн магазин",
  company: "Име на фирмата",
  urgency: "До кога искаш да разрешиш този проблем?",
} as const;

export const targetAudiencesContent = {
  teaser: {
    badge: "Безплатни неща",
    title: "3 Потенциални целеви аудитории",
    description:
      "Вземи безплатно видео с твоите 3 потенциални целеви аудитории и защо е хубаво да ги таргетираш тях.",
    helper:
      "Не е нужно да знаеш технически неща - говорим на чист Български език.",
    cta: "Вземи 3 безплатни аудитории",
  },
  formPage: {
    badge: "Безплатни неща",
    title: "Вземи твоите 3 целеви аудитории",
    description:
      "Попълни формата и ще ти изпратим персонализиран анализ с 3 потенциални целеви аудитории.",
    disclaimer:
      "Без разходи, без задължения, без досадни опити за продажба. Гарантирано.",
    submit: "Вземи 3 безплатни аудитории",
    successTitle: "Готово - получихме заявката ти.",
    successDescription:
      "Ще ти изпратим анализа с 3 потенциални целеви аудитории на посочения имейл.",
  },
} as const;
