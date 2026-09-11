export type EmailRecipientRole = "customer" | "admin";

export type EmailCatalogRecipient = {
  role: EmailRecipientRole;
  /** Human-readable destination (may include env var names). */
  to: string;
  label: string;
};

export type EmailCatalogEntry = {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  subject: string;
  recipients: EmailCatalogRecipient[];
  trigger: string;
  sourceFile: string;
};

const ADMIN_TO =
  "ADMIN_EMAIL (fallback: admin_email / CONSULTATION_NOTIFY_EMAIL / Gmail user)";
const CUSTOMER_TO = "Имейл на клиента / абоната";

const TIPS_NURTURE_STAGES: Array<{ stage: number; subject: string }> = [
  { stage: 1, subject: "3 неща" },
  { stage: 2, subject: "всички мамят" },
  { stage: 3, subject: "единственото нещо, което има значение" },
  { stage: 4, subject: "това никога не спира" },
  { stage: 5, subject: "дали си заслужава?" },
  { stage: 6, subject: "просто и работи" },
  { stage: 7, subject: "най-добрият предсказател" },
  { stage: 8, subject: "на върха на хълма" },
  { stage: 9, subject: "всички грешат" },
  { stage: 10, subject: "breadcrumbing" },
  { stage: 11, subject: "накарай го да спре" },
  { stage: 12, subject: "това никога не спира" },
  { stage: 13, subject: "единственото нещо, което има значение" },
  { stage: 14, subject: "дали си заслужава?" },
  { stage: 15, subject: "едното нещо" },
  { stage: 16, subject: "трябва да е така" },
];

export const EMAIL_CATALOG: EmailCatalogEntry[] = [
  {
    id: "order-customer",
    category: "orders",
    categoryLabel: "Поръчки",
    name: "Потвърждение за платена поръчка",
    subject: "Поръчката ви е потвърдена - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "След успешно плащане (Stripe webhook / polling)",
    sourceFile: "lib/server/order-emails.ts",
  },
  {
    id: "order-admin",
    category: "orders",
    categoryLabel: "Поръчки",
    name: "Нова платена поръчка (админ)",
    subject: "Нова платена поръчка: {orderId}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "Заедно с клиентското потвърждение при плащане",
    sourceFile: "lib/server/order-emails.ts",
  },
  {
    id: "consultation-customer",
    category: "consultations",
    categoryLabel: "Консултации",
    name: "Потвърждение за консултация",
    subject: "Потвърждение за консултация - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "След записване на час и създаване на Google Calendar събитие",
    sourceFile: "lib/emails/consultation-emails.tsx",
  },
  {
    id: "consultation-admin",
    category: "consultations",
    categoryLabel: "Консултации",
    name: "Нова консултация (админ)",
    subject: "Нова консултация: {име}",
    recipients: [{ role: "admin", to: ADMIN_TO, label: "Админ" }],
    trigger: "Заедно с клиентското потвърждение при записване",
    sourceFile: "lib/emails/consultation-emails.tsx",
  },
  {
    id: "newsletter-customer",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Добре дошли в бюлетина",
    subject: "Благодарим за записването в бюлетина - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Абонат" }],
    trigger: "Нов абонамент за бюлетин",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "newsletter-admin",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Нов абонамент за бюлетин (админ)",
    subject: "Нов бюлетин абонамент: {email}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "При нов абонамент за бюлетин",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "niche-customer",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Препоръка за ниша",
    subject: "Записахме препоръката ви за ниша - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Абонат" }],
    trigger: "Препоръка за ниша от страницата с шаблони (нова ниша за имейла)",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "niche-admin",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Нова препоръка за ниша (админ)",
    subject: "Нова препоръка за ниша: {ниша}",
    recipients: [
      {
        role: "admin",
        to: "GOOGLE_EMAIL_USER / ADMIN_EMAIL",
        label: "Админ",
      },
    ],
    trigger: "При нова препоръка за ниша",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "google-newsletter-customer",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Google бюлетин — потвърждение",
    subject: "Успешно записахте за бюлетина - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Абонат" }],
    trigger: "Абонамент за Google / SEO бюлетин",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "google-newsletter-admin",
    category: "newsletter",
    categoryLabel: "Бюлетин",
    name: "Google бюлетин — админ",
    subject: "Нов абонамент за Google бюлетин - {email}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "При първи абонамент за този източник",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "tips-signup-customer",
    category: "free-tips",
    categoryLabel: "3 безплатни съвета",
    name: "Доставка на видеото с 3 съвета",
    subject: "3 безплатни съвета за Google - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Абонат" }],
    trigger: "Форма за 3 безплатни съвета",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  {
    id: "tips-signup-admin",
    category: "free-tips",
    categoryLabel: "3 безплатни съвета",
    name: "Нов абонамент за 3 съвета (админ)",
    subject: "Нов абонамент: 3 безплатни съвета - {email}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "При първи запис за 3 безплатни съвета",
    sourceFile: "lib/emails/newsletter-emails.ts",
  },
  ...TIPS_NURTURE_STAGES.map(
    (stage): EmailCatalogEntry => ({
      id: `tips-stage-${stage.stage}`,
      category: "free-tips-nurture",
      categoryLabel: "Nurture: 3 съвета (16 етапа)",
      name: `Етап ${stage.stage}`,
      subject: stage.subject,
      recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Абонат" }],
      trigger: "Дневна кампания от админ панел „Безплатни“ (или тест изпращане)",
      sourceFile: `lib/emails/three-free-tips-stages/stage-${stage.stage}.tsx`,
    }),
  ),
  {
    id: "support-admin",
    category: "support",
    categoryLabel: "Чат за помощ",
    name: "Нова заявка за помощ",
    subject: "Нова заявка за помощ: {име}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "Първо съобщение на клиента в чат за помощ",
    sourceFile: "lib/emails/support-chat-emails.ts",
  },
  {
    id: "target-audience-customer",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "3 целеви аудитории — клиент",
    subject: "Получихме заявката ти за 3 целеви аудитории",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "Форма за 3 целеви аудитории",
    sourceFile: "lib/emails/target-audience-emails.ts",
  },
  {
    id: "target-audience-admin",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "3 целеви аудитории — админ",
    subject: "Нова заявка: 3 целеви аудитории",
    recipients: [{ role: "admin", to: ADMIN_TO, label: "Админ" }],
    trigger: "Форма за 3 целеви аудитории",
    sourceFile: "lib/emails/target-audience-emails.ts",
  },
  {
    id: "google-analysis-customer",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Безплатен Google анализ — клиент",
    subject: "Получихме заявката ти за безплатен Google анализ",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "Форма за безплатен Google анализ",
    sourceFile: "lib/emails/google-free-analysis-emails.ts",
  },
  {
    id: "google-analysis-admin",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Безплатен Google анализ — админ",
    subject: "Нова заявка: безплатен Google анализ - {email}",
    recipients: [{ role: "admin", to: ADMIN_TO, label: "Админ" }],
    trigger: "Форма за безплатен Google анализ",
    sourceFile: "lib/emails/google-free-analysis-emails.ts",
  },
  {
    id: "google-3-tips-analysis-customer",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Анализ 3 съвета — клиент",
    subject: "Получихме заявката ти за Анализ 3 съвета",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "Форма „Анализ 3 съвета“",
    sourceFile: "lib/emails/google-analysis-3-tips-emails.ts",
  },
  {
    id: "google-3-tips-analysis-admin",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Анализ 3 съвета — админ",
    subject: "Нова заявка: Анализ 3 съвета - {email}",
    recipients: [{ role: "admin", to: ADMIN_TO, label: "Админ" }],
    trigger: "Форма „Анализ 3 съвета“",
    sourceFile: "lib/emails/google-analysis-3-tips-emails.ts",
  },
  {
    id: "roadmap-customer",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Дигитална пътна карта — клиент",
    subject: "Вашата дигитална пътна карта - DigiStart",
    recipients: [{ role: "customer", to: CUSTOMER_TO, label: "Клиент" }],
    trigger: "Форма за дигитална пътна карта",
    sourceFile: "lib/emails/digital-roadmap-emails.tsx",
  },
  {
    id: "roadmap-admin",
    category: "leads",
    categoryLabel: "Лийд форми",
    name: "Дигитална пътна карта — админ",
    subject: "Нова заявка за пътна карта: {email}",
    recipients: [{ role: "admin", to: "ADMIN_EMAIL", label: "Админ" }],
    trigger: "Форма за дигитална пътна карта",
    sourceFile: "lib/emails/digital-roadmap-emails.tsx",
  },
];

export function getEmailCatalogEntry(id: string): EmailCatalogEntry | undefined {
  return EMAIL_CATALOG.find((entry) => entry.id === id);
}

export function groupEmailCatalogByCategory(
  entries: EmailCatalogEntry[] = EMAIL_CATALOG,
): Array<{ category: string; categoryLabel: string; entries: EmailCatalogEntry[] }> {
  const order: string[] = [];
  const map = new Map<string, { categoryLabel: string; entries: EmailCatalogEntry[] }>();

  for (const entry of entries) {
    const existing = map.get(entry.category);
    if (!existing) {
      order.push(entry.category);
      map.set(entry.category, {
        categoryLabel: entry.categoryLabel,
        entries: [entry],
      });
    } else {
      existing.entries.push(entry);
    }
  }

  return order.map((category) => {
    const group = map.get(category)!;
    return {
      category,
      categoryLabel: group.categoryLabel,
      entries: group.entries,
    };
  });
}
