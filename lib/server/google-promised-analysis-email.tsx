import nodemailer from "nodemailer";
import { google } from "googleapis";
import { render } from "@react-email/render";
import {
  PROMISED_ANALYSIS_EMAIL_SUBJECT,
  PROMISED_ANALYSIS_TEST_INBOX,
} from "@/lib/emails/google-promised-analysis-constants";
import { GooglePromisedAnalysisEmail } from "@/lib/emails/google-promised-analysis-email";
import { appendTrackingUid } from "@/lib/emails/unsubscribe";
import { prisma } from "@/lib/prisma";
import {
  isEmailTestMode,
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

const CONSULTATION_URL = "https://digistart.bg/business-consultation";

export type PromisedAnalysisLeadKind =
  | "google-free-analysis"
  | "google-analysis-3-tips";

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

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function loadLead(kind: PromisedAnalysisLeadKind, id: string) {
  if (kind === "google-analysis-3-tips") {
    return prisma.googleAnalysis3TipsLead.findUnique({ where: { id } });
  }
  return prisma.googleFreeAnalysisLead.findUnique({ where: { id } });
}

export async function sendGooglePromisedAnalysisEmail(params: {
  leadId: string;
  leadKind: PromisedAnalysisLeadKind;
  youtubeUrl: string;
  greetingName?: string;
  /** When true, always send to the fixed test inbox with the same content. */
  test?: boolean;
}): Promise<{ to: string; subject: string; originalTo: string }> {
  const youtubeUrl = params.youtubeUrl.trim();
  if (!isValidHttpUrl(youtubeUrl)) {
    throw new Error("Моля, въведете валиден линк към YouTube клипа.");
  }

  const lead = await loadLead(params.leadKind, params.leadId);
  if (!lead) {
    throw new Error("Заявката не е намерена.");
  }

  const from = resolveFromAddress();
  const mailer = await createOAuth2Transporter();
  if (!mailer || !from) {
    throw new Error(
      "Имейл конфигурацията липсва (Gmail OAuth / SMTP_FROM). Проверете env променливите.",
    );
  }

  const name = (params.greetingName?.trim() || lead.name).trim();
  const consultationUrl = appendTrackingUid(CONSULTATION_URL, lead.id);
  const originalTo = lead.email;
  const testMode = params.test ? true : isEmailTestMode(originalTo);

  const delivery = params.test
    ? {
        testMode: true,
        customerTo: PROMISED_ANALYSIS_TEST_INBOX,
        adminTo: PROMISED_ANALYSIS_TEST_INBOX,
      }
    : resolveOutboundEmailDelivery({
        customerEmail: originalTo,
        adminEmail: "",
      });

  const html = await render(
    <GooglePromisedAnalysisEmail
      name={name}
      youtubeUrl={youtubeUrl}
      consultationUrl={consultationUrl}
      recipientUid={lead.id}
    />,
  );

  const subject = withTestSubject(PROMISED_ANALYSIS_EMAIL_SUBJECT, testMode || delivery.testMode);
  const text = withTestTextBody(
    [
      `Здравейте, ${name},`,
      "",
      "Това е обещаният клип с безплатен анализ за по-добро класиране в Google.",
      "",
      `Линк към клипа: ${youtubeUrl}`,
      "",
      `Линк за безплатна консултация: ${consultationUrl}`,
      "",
      "До скоро,",
      "Емил Златинов",
    ].join("\n"),
    testMode || delivery.testMode,
    { originalTo },
  );

  await mailer.sendMail({
    from: withTestFrom(from, testMode || delivery.testMode),
    to: delivery.customerTo,
    subject,
    html: withTestHtmlBody(html, testMode || delivery.testMode, { originalTo }),
    text,
  });

  return {
    to: delivery.customerTo,
    subject: PROMISED_ANALYSIS_EMAIL_SUBJECT,
    originalTo,
  };
}
