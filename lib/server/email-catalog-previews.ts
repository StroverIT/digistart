import {
  getEmailCatalogEntry,
  type EmailCatalogEntry,
} from "@/lib/emails/email-catalog";
import {
  renderConsultationAdminEmailHtml,
  renderConsultationCustomerEmailHtml,
} from "@/lib/emails/consultation-emails";
import {
  renderDigitalRoadmapAdminEmailHtml,
  renderDigitalRoadmapSubscriberEmailHtml,
} from "@/lib/emails/digital-roadmap-emails";
import {
  renderGoogleAnalysis3TipsAdminHtml,
  renderGoogleAnalysis3TipsCustomerHtml,
} from "@/lib/emails/google-analysis-3-tips-emails";
import {
  renderGoogleFreeAnalysisAdminHtml,
  renderGoogleFreeAnalysisCustomerHtml,
} from "@/lib/emails/google-free-analysis-emails";
import {
  renderGoogleNewsletterAdminEmailHtml,
  renderGoogleNewsletterSubscriberEmailHtml,
  renderNewsletterAdminEmailHtml,
  renderNewsletterSubscriberEmailHtml,
  renderNicheRecommendationAdminEmailHtml,
  renderNicheRecommendationSubscriberEmailHtml,
  renderThreeFreeTipsAdminEmailHtml,
  renderThreeFreeTipsSubscriberEmailHtml,
} from "@/lib/emails/newsletter-emails";
import { renderSupportChatAdminEmailHtml } from "@/lib/emails/support-chat-emails";
import {
  renderTargetAudienceAdminHtml,
  renderTargetAudienceCustomerHtml,
} from "@/lib/emails/target-audience-emails";
import {
  renderOrderAdminEmailHtml,
  renderOrderCustomerEmailHtml,
} from "@/lib/server/order-emails";
import { previewThreeFreeTipsStageEmail } from "@/lib/server/three-free-tips-campaign";
import { getSiteUrl } from "@/lib/emails/unsubscribe";

const PREVIEW_EMAIL = "preview@example.com";
const PREVIEW_NAME = "Иван Петров";
const PREVIEW_PHONE = "+359 888 000 000";
const PREVIEW_COMPANY = "Пример ООД";
const PREVIEW_NOW = new Date("2026-03-15T10:00:00+02:00");

export type EmailPreviewResult = {
  id: string;
  name: string;
  subject: string;
  html: string;
  recipients: EmailCatalogEntry["recipients"];
  trigger: string;
  sourceFile: string;
};

async function buildHtml(id: string): Promise<{ subject: string; html: string } | null> {
  switch (id) {
    case "order-customer":
      return {
        subject: "Поръчката ви е потвърдена - DigiStart",
        html: await renderOrderCustomerEmailHtml({
          customerFirstName: "Иван",
          orderId: "ord_preview_123",
        }),
      };
    case "order-admin":
      return {
        subject: "Нова платена поръчка: ord_preview_123",
        html: await renderOrderAdminEmailHtml({
          orderId: "ord_preview_123",
          customerName: PREVIEW_NAME,
          customerEmail: PREVIEW_EMAIL,
        }),
      };
    case "consultation-customer":
      return {
        subject: "Потвърждение за консултация - DigiStart",
        html: await renderConsultationCustomerEmailHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          phone: PREVIEW_PHONE,
          company: PREVIEW_COMPANY,
          notes: "Интерес към Google реклама",
          date: "2026-03-20",
          time: "11:00",
          source: "public",
          sourcePage: "/consultation",
          timezone: "Europe/Sofia",
          meetUrl: "https://meet.google.com/abc-defg-hij",
          meetingType: "online",
          calendarUrl: "https://calendar.google.com/calendar/event?eid=preview",
        }),
      };
    case "consultation-admin":
      return {
        subject: `Нова консултация: ${PREVIEW_NAME}`,
        html: await renderConsultationAdminEmailHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          phone: PREVIEW_PHONE,
          company: PREVIEW_COMPANY,
          notes: "Интерес към Google реклама",
          date: "2026-03-20",
          time: "11:00",
          source: "public",
          sourcePage: "/consultation",
          timezone: "Europe/Sofia",
          meetUrl: "https://meet.google.com/abc-defg-hij",
          meetingType: "online",
          calendarUrl: "https://calendar.google.com/calendar/event?eid=preview",
        }),
      };
    case "newsletter-customer":
      return {
        subject: "Благодарим за записването в бюлетина - DigiStart",
        html: await renderNewsletterSubscriberEmailHtml({ email: PREVIEW_EMAIL }),
      };
    case "newsletter-admin":
      return {
        subject: `Нов бюлетин абонамент: ${PREVIEW_EMAIL}`,
        html: await renderNewsletterAdminEmailHtml({
          email: PREVIEW_EMAIL,
          source: "website",
          subscribedAt: PREVIEW_NOW,
        }),
      };
    case "niche-customer":
      return {
        subject: "Записахме препоръката ви за ниша - DigiStart",
        html: await renderNicheRecommendationSubscriberEmailHtml({
          email: PREVIEW_EMAIL,
          niche: "зъболекар",
        }),
      };
    case "niche-admin":
      return {
        subject: "Нова препоръка за ниша: зъболекар",
        html: await renderNicheRecommendationAdminEmailHtml({
          email: PREVIEW_EMAIL,
          niche: "зъболекар",
          submittedAt: PREVIEW_NOW,
          isNewSubscriber: true,
        }),
      };
    case "google-newsletter-customer":
      return {
        subject: "Успешно записахте за бюлетина - DigiStart",
        html: await renderGoogleNewsletterSubscriberEmailHtml({
          firstName: "Иван",
          email: PREVIEW_EMAIL,
        }),
      };
    case "google-newsletter-admin":
      return {
        subject: `Нов абонамент за Google бюлетин - ${PREVIEW_EMAIL}`,
        html: await renderGoogleNewsletterAdminEmailHtml({
          email: PREVIEW_EMAIL,
          firstName: "Иван",
          source: "google-newsletter",
          subscribedAt: PREVIEW_NOW,
        }),
      };
    case "tips-signup-customer": {
      const siteUrl = getSiteUrl();
      return {
        subject: "3 безплатни съвета за Google - DigiStart",
        html: await renderThreeFreeTipsSubscriberEmailHtml({
          email: PREVIEW_EMAIL,
          videoUrl: `${siteUrl}/services/google-business`,
        }),
      };
    }
    case "tips-signup-admin":
      return {
        subject: `Нов абонамент: 3 безплатни съвета - ${PREVIEW_EMAIL}`,
        html: await renderThreeFreeTipsAdminEmailHtml({
          email: PREVIEW_EMAIL,
          source: "three-free-tips",
          subscribedAt: PREVIEW_NOW,
        }),
      };
    case "support-admin":
      return {
        subject: `Нова заявка за помощ: ${PREVIEW_NAME}`,
        html: await renderSupportChatAdminEmailHtml({
          customerName: PREVIEW_NAME,
          customerEmail: PREVIEW_EMAIL,
          problemSummary: "Не мога да вляза в клиентския панел след плащане.",
          chatUrl: `${getSiteUrl()}/admin/support/preview-chat`,
        }),
      };
    case "target-audience-customer":
      return {
        subject: "Получихме заявката ти за 3 целеви аудитории",
        html: renderTargetAudienceCustomerHtml(PREVIEW_NAME),
      };
    case "target-audience-admin":
      return {
        subject: "Нова заявка: 3 целеви аудитории",
        html: renderTargetAudienceAdminHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          phone: PREVIEW_PHONE,
          company: PREVIEW_COMPANY,
          website: "https://example.bg",
          urgency: "few_weeks",
          source: "target-audience",
          createdAt: PREVIEW_NOW,
        }),
      };
    case "google-analysis-customer":
      return {
        subject: "Получихме заявката ти за безплатен Google анализ",
        html: renderGoogleFreeAnalysisCustomerHtml(PREVIEW_NAME),
      };
    case "google-analysis-admin":
      return {
        subject: `Нова заявка: безплатен Google анализ - ${PREVIEW_EMAIL}`,
        html: renderGoogleFreeAnalysisAdminHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          phone: PREVIEW_PHONE,
          website: "https://example.bg",
          company: PREVIEW_COMPANY,
          googleMapsUrl: "https://maps.google.com/?cid=preview",
          urgency: "few_weeks",
          source: "google-free-analysis",
          createdAt: PREVIEW_NOW,
        }),
      };
    case "google-3-tips-analysis-customer":
      return {
        subject: "Получихме заявката ти за Анализ 3 съвета",
        html: renderGoogleAnalysis3TipsCustomerHtml(PREVIEW_NAME),
      };
    case "google-3-tips-analysis-admin":
      return {
        subject: `Нова заявка: Анализ 3 съвета - ${PREVIEW_EMAIL}`,
        html: renderGoogleAnalysis3TipsAdminHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          phone: PREVIEW_PHONE,
          website: "https://example.bg",
          company: PREVIEW_COMPANY,
          googleMapsUrl: "https://maps.google.com/?cid=preview",
          urgency: "few_weeks",
          source: "google-analysis-3-tips",
          createdAt: PREVIEW_NOW,
        }),
      };
    case "roadmap-customer":
      return {
        subject: "Вашата дигитална пътна карта - DigiStart",
        html: await renderDigitalRoadmapSubscriberEmailHtml({ name: PREVIEW_NAME }),
      };
    case "roadmap-admin":
      return {
        subject: `Нова заявка за пътна карта: ${PREVIEW_EMAIL}`,
        html: await renderDigitalRoadmapAdminEmailHtml({
          name: PREVIEW_NAME,
          email: PREVIEW_EMAIL,
          source: "digital-roadmap",
          createdAt: PREVIEW_NOW,
        }),
      };
    default: {
      const stageMatch = /^tips-stage-(\d+)$/.exec(id);
      if (!stageMatch) return null;
      const stage = Number.parseInt(stageMatch[1]!, 10);
      const preview = await previewThreeFreeTipsStageEmail(stage);
      if (!preview) return null;
      return { subject: preview.subject, html: preview.html };
    }
  }
}

export async function previewEmailCatalogEntry(
  id: string,
): Promise<EmailPreviewResult | null> {
  const entry = getEmailCatalogEntry(id);
  if (!entry) return null;

  const rendered = await buildHtml(id);
  if (!rendered) return null;

  return {
    id: entry.id,
    name: entry.name,
    subject: rendered.subject,
    html: rendered.html,
    recipients: entry.recipients,
    trigger: entry.trigger,
    sourceFile: entry.sourceFile,
  };
}
