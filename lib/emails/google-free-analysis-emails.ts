import nodemailer from "nodemailer";
import { google } from "googleapis";
import { getGoogleFreeAnalysisUrgencyLabel } from "@/lib/data/google-free-analysis-content";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

type GoogleFreeAnalysisEmailInput = {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  googleMapsUrl: string;
  urgency: string;
  source: string;
  createdAt: Date;
};

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCustomerHtml(name: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Здравей, ${escapeHtml(name)}!</h2>
      <p style="margin: 0 0 12px;">
        Благодарим ти за заявката за безплатен Google анализ.
      </p>
      <p style="margin: 0 0 12px;">
        Екипът на DigiStart преглежда информацията ти и скоро ще получиш персонализирания анализ.
      </p>
      <p style="margin: 0;">Поздрави,<br />Екипът на DigiStart</p>
    </div>
  `;
}

function renderAdminHtml(input: GoogleFreeAnalysisEmailInput) {
  const urgency = getGoogleFreeAnalysisUrgencyLabel(input.urgency);
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Нова заявка: безплатен Google анализ</h2>
      <ul style="padding-left: 18px; margin: 0;">
        <li><strong>Име:</strong> ${escapeHtml(input.name)}</li>
        <li><strong>Имейл:</strong> ${escapeHtml(input.email)}</li>
        <li><strong>Телефон:</strong> ${escapeHtml(input.phone)}</li>
        <li><strong>Уебсайт:</strong> ${escapeHtml(input.website)}</li>
        <li><strong>Фирма:</strong> ${escapeHtml(input.company)}</li>
        <li><strong>Google Maps:</strong> ${escapeHtml(input.googleMapsUrl)}</li>
        <li><strong>Срок:</strong> ${escapeHtml(urgency)}</li>
        <li><strong>Източник:</strong> ${escapeHtml(input.source)}</li>
      </ul>
    </div>
  `;
}

function renderAdminText(input: GoogleFreeAnalysisEmailInput) {
  return [
    "Нова заявка: безплатен Google анализ",
    `Име: ${input.name}`,
    `Имейл: ${input.email}`,
    `Телефон: ${input.phone}`,
    `Уебсайт: ${input.website}`,
    `Фирма: ${input.company}`,
    `Google Maps: ${input.googleMapsUrl}`,
    `Срок: ${getGoogleFreeAnalysisUrgencyLabel(input.urgency)}`,
    `Източник: ${input.source}`,
  ].join("\n");
}

export async function sendGoogleFreeAnalysisLeadEmails(input: GoogleFreeAnalysisEmailInput) {
  const senderEmail = resolveGmailUser();
  const from = resolveFromAddress();
  const notifyEmail =
    process.env.ADMIN_EMAIL ||
    process.env.admin_email ||
    process.env.CONSULTATION_NOTIFY_EMAIL;

  if (!from || !senderEmail || !notifyEmail) {
    throw new Error("Missing required email configuration.");
  }

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: input.email,
    adminEmail: notifyEmail,
  });

  const transporter = await createOAuth2Transporter();
  if (!transporter) throw new Error("Missing OAuth email config");

  const customerSubject = withTestSubject(
    "Получихме заявката ти за безплатен Google анализ",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    `Нова заявка: безплатен Google анализ - ${input.email}`,
    delivery.testMode,
  );

  const sends = await Promise.allSettled([
    transporter.sendMail({
      from: withTestFrom(from, delivery.testMode),
      to: delivery.customerTo,
      subject: customerSubject,
      text: withTestTextBody(
        "Благодарим ти! Получихме заявката ти за безплатен Google анализ.",
        delivery.testMode,
        { originalTo: input.email },
      ),
      html: withTestHtmlBody(renderCustomerHtml(input.name), delivery.testMode, {
        originalTo: input.email,
      }),
    }),
    transporter.sendMail({
      from: withTestFrom(from, delivery.testMode),
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(renderAdminText(input), delivery.testMode, {
        originalTo: notifyEmail,
      }),
      html: withTestHtmlBody(renderAdminHtml(input), delivery.testMode, {
        originalTo: notifyEmail,
      }),
    }),
  ]);

  if (sends.some((result) => result.status === "rejected")) {
    throw new Error("One or more google free analysis emails failed to send.");
  }
}
