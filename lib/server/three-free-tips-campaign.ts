import nodemailer from "nodemailer";
import { google } from "googleapis";
import { render } from "@react-email/render";
import {
  getLastThreeFreeTipsStageNumber,
  getThreeFreeTipsStage,
  listThreeFreeTipsStageNumbers,
  THREE_FREE_TIPS_STAGES,
} from "@/lib/emails/three-free-tips-stages";
import { prisma } from "@/lib/prisma";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";
import { THREE_FREE_TIPS_SOURCE } from "@/lib/server/newsletter";

const BATCH_SIZE = 10;

function resolveGmailUser(): string | undefined {
  const pairs = [
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER,
    process.env.GOOGLE_EMAIL_USER,
    process.env.GMAIL_USER,
    process.env.SMTP_USER,
    process.env.CONSULTATION_NOTIFY_EMAIL,
  ] as const;
  return pairs.find(Boolean);
}

async function createOAuth2Transporter() {
  const gmailUser = resolveGmailUser();
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.REDIRECT_URI;
  if (
    !gmailUser ||
    !googleClientId ||
    !googleClientSecret ||
    !googleRefreshToken ||
    !redirectUri
  ) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri,
  );
  oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
      accessToken: accessToken.token ?? undefined,
    },
  });
}

function resolveFromAddress(): string | undefined {
  const gmailUser = resolveGmailUser();
  return process.env.SMTP_FROM ?? (gmailUser ? `DigiStart <${gmailUser}>` : undefined);
}

function isTipsSubscriber(row: {
  source: string;
  metadata: unknown;
}): boolean {
  if (row.source === THREE_FREE_TIPS_SOURCE) return true;
  if (!row.metadata || typeof row.metadata !== "object" || Array.isArray(row.metadata)) {
    return false;
  }
  return "threeFreeTipsAt" in row.metadata;
}

/** Calendar date YYYY-MM-DD in Europe/Sofia. */
export function sofiaCalendarDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function wasSentTodaySofia(sentAt: Date | null | undefined): boolean {
  if (!sentAt) return false;
  return sofiaCalendarDate(sentAt) === sofiaCalendarDate();
}

/** True when the subscriber has finished all registered stages (e.g. stage 8 with 7 stages). */
export function isTipsCampaignCompleted(stage: number, lastStage = getLastThreeFreeTipsStageNumber()): boolean {
  return lastStage > 0 && stage > lastStage;
}

/**
 * Only stages with a registered template are sendable.
 * Beyond the last stage: no email and no further +1.
 */
export function canSendTipsCampaignStage(
  stage: number,
  lastStage = getLastThreeFreeTipsStageNumber(),
): boolean {
  if (isTipsCampaignCompleted(stage, lastStage)) return false;
  return Boolean(getThreeFreeTipsStage(stage));
}

/** After a successful send, advance by 1 but never past lastStage + 1 (completed marker). */
export function nextTipsCampaignStage(
  currentStage: number,
  lastStage = getLastThreeFreeTipsStageNumber(),
): number {
  if (isTipsCampaignCompleted(currentStage, lastStage)) {
    return currentStage;
  }
  return Math.min(currentStage + 1, lastStage + 1);
}

export type ThreeFreeTipsCampaignSummary = {
  stages: Array<{ stage: number; subject: string; count: number }>;
  completedCount: number;
  eligibleTodayCount: number;
  totalTipsSubscribers: number;
};

export async function getThreeFreeTipsCampaignSummary(): Promise<ThreeFreeTipsCampaignSummary> {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    select: {
      source: true,
      metadata: true,
      tipsEmailStage: true,
      tipsLastEmailSentAt: true,
    },
  });

  const tips = subscribers.filter(isTipsSubscriber);
  const lastStage = getLastThreeFreeTipsStageNumber();
  const stageNumbers = listThreeFreeTipsStageNumbers();

  const countsByStage = new Map<number, number>();
  for (const stage of stageNumbers) {
    countsByStage.set(stage, 0);
  }

  let completedCount = 0;
  let eligibleTodayCount = 0;

  for (const row of tips) {
    const stage = row.tipsEmailStage ?? 1;
    if (isTipsCampaignCompleted(stage, lastStage)) {
      completedCount += 1;
      continue;
    }

    if (countsByStage.has(stage)) {
      countsByStage.set(stage, (countsByStage.get(stage) ?? 0) + 1);
    } else if (getThreeFreeTipsStage(stage)) {
      countsByStage.set(stage, 1);
    }

    if (
      canSendTipsCampaignStage(stage, lastStage) &&
      !wasSentTodaySofia(row.tipsLastEmailSentAt)
    ) {
      eligibleTodayCount += 1;
    }
  }

  return {
    stages: stageNumbers.map((stage) => {
      const def = getThreeFreeTipsStage(stage)!;
      return {
        stage,
        subject: def.subject,
        count: countsByStage.get(stage) ?? 0,
      };
    }),
    completedCount,
    eligibleTodayCount,
    totalTipsSubscribers: tips.length,
  };
}

export async function previewThreeFreeTipsStageEmail(stage: number): Promise<{
  stage: number;
  subject: string;
  html: string;
} | null> {
  const def = getThreeFreeTipsStage(stage);
  if (!def) return null;

  const html = await render(def.render());
  return {
    stage: def.stage,
    subject: def.subject,
    html,
  };
}

export type ThreeFreeTipsDailySendResult = {
  sent: number;
  failed: number;
  skipped: number;
  byStage: Record<string, { sent: number; failed: number }>;
  errors: Array<{ email: string; stage: number; message: string }>;
};

async function sendStageEmailToSubscriber(params: {
  email: string;
  stage: number;
  mailer: NonNullable<Awaited<ReturnType<typeof createOAuth2Transporter>>>;
  from: string;
}): Promise<void> {
  const def = getThreeFreeTipsStage(params.stage);
  if (!def) {
    throw new Error(`Няма шаблон за етап ${params.stage}`);
  }

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: params.email,
    adminEmail: "",
  });

  const html = await render(def.render());
  const subject = withTestSubject(def.subject, delivery.testMode);
  const text = withTestTextBody(
    `${def.previewText}\n\nПоздрави,\nDigiStart`,
    delivery.testMode,
  );

  await params.mailer.sendMail({
    from: withTestFrom(params.from, delivery.testMode),
    to: delivery.customerTo,
    subject,
    html: withTestHtmlBody(html, delivery.testMode),
    text,
  });
}

export async function sendDailyThreeFreeTipsStageEmails(): Promise<ThreeFreeTipsDailySendResult> {
  const from = resolveFromAddress();
  const mailer = await createOAuth2Transporter();

  if (!mailer || !from) {
    throw new Error(
      "Имейл конфигурацията липсва (Gmail OAuth / SMTP_FROM). Проверете env променливите.",
    );
  }

  if (THREE_FREE_TIPS_STAGES.length === 0) {
    return { sent: 0, failed: 0, skipped: 0, byStage: {}, errors: [] };
  }

  const lastStage = getLastThreeFreeTipsStageNumber();
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "asc" },
  });

  const eligible = subscribers.filter((row) => {
    if (!isTipsSubscriber(row)) return false;
    const stage = row.tipsEmailStage ?? 1;
    // Past last stage (e.g. 8 of 7): skip — no email, no +1.
    if (!canSendTipsCampaignStage(stage, lastStage)) return false;
    if (wasSentTodaySofia(row.tipsLastEmailSentAt)) return false;
    return true;
  });

  const result: ThreeFreeTipsDailySendResult = {
    sent: 0,
    failed: 0,
    skipped: subscribers.filter(isTipsSubscriber).length - eligible.length,
    byStage: {},
    errors: [],
  };

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const stage = row.tipsEmailStage ?? 1;
        if (!canSendTipsCampaignStage(stage, lastStage)) {
          throw new Error(`Етап ${stage} е извън поредицата — пропускане`);
        }
        await sendStageEmailToSubscriber({
          email: row.email,
          stage,
          mailer,
          from,
        });
        // Advance only after successful send; never climb past lastStage + 1.
        await prisma.newsletterSubscriber.update({
          where: { id: row.id },
          data: {
            tipsEmailStage: nextTipsCampaignStage(stage, lastStage),
            tipsLastEmailSentAt: new Date(),
          },
        });
        return { email: row.email, stage };
      }),
    );

    for (let j = 0; j < settled.length; j++) {
      const outcome = settled[j]!;
      const row = batch[j]!;
      const stage = row.tipsEmailStage ?? 1;
      const key = String(stage);
      if (!result.byStage[key]) {
        result.byStage[key] = { sent: 0, failed: 0 };
      }

      if (outcome.status === "fulfilled") {
        result.sent += 1;
        result.byStage[key].sent += 1;
      } else {
        result.failed += 1;
        result.byStage[key].failed += 1;
        const message =
          outcome.reason instanceof Error
            ? outcome.reason.message
            : "Неуспешно изпращане";
        result.errors.push({ email: row.email, stage, message });
      }
    }
  }

  return result;
}
