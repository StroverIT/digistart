import nodemailer from "nodemailer";
import { google } from "googleapis";
import { getUrgencyLabel } from "@/lib/data/target-audiences-content";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

type TargetAudienceEmailInput = {
  name: string;
  email: string;
  phone: string;
  website?: string;
  company: string;
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

function renderCustomerHtml(name: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Здравей, ${name}!</h2>
      <p style="margin: 0 0 12px;">
        Благодарим ти за интереса към анализа с 3 потенциални целеви аудитории.
      </p>
      <p style="margin: 0 0 12px;">
        Екипът на DigiStart вече преглежда информацията ти и скоро ще получиш от нас персонализиран анализ.
      </p>
      <p style="margin: 0;">Поздрави,<br />Екипът на DigiStart</p>
    </div>
  `;
}

function renderAdminHtml(input: TargetAudienceEmailInput) {
  const urgency = getUrgencyLabel(input.urgency);
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Нова заявка: 3 целеви аудитории</h2>
      <ul style="padding-left: 18px; margin: 0;">
        <li><strong>Име:</strong> ${input.name}</li>
        <li><strong>Имейл:</strong> ${input.email}</li>
        <li><strong>Телефон:</strong> ${input.phone}</li>
        <li><strong>Компания:</strong> ${input.company}</li>
        <li><strong>Уебсайт:</strong> ${input.website || "-"}</li>
        <li><strong>Срок:</strong> ${urgency}</li>
        <li><strong>Източник:</strong> ${input.source}</li>
      </ul>
    </div>
  `;
}

function renderAdminText(input: TargetAudienceEmailInput) {
  return [
    "Нова заявка: 3 целеви аудитории",
    `Име: ${input.name}`,
    `Имейл: ${input.email}`,
    `Телефон: ${input.phone}`,
    `Компания: ${input.company}`,
    `Уебсайт: ${input.website || "-"}`,
    `Срок: ${getUrgencyLabel(input.urgency)}`,
    `Източник: ${input.source}`,
  ].join("\n");
}

export async function sendTargetAudienceLeadEmails(input: TargetAudienceEmailInput) {
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
    "Получихме заявката ти за 3 целеви аудитории",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    "Нова заявка: 3 целеви аудитории",
    delivery.testMode,
  );

  const customerHtml = renderCustomerHtml(input.name);
  const adminHtml = renderAdminHtml(input);
  const adminText = renderAdminText(input);

  const sends = await Promise.allSettled([
    transporter.sendMail({
      from: withTestFrom(from, delivery.testMode),
      to: delivery.customerTo,
      subject: customerSubject,
      text: withTestTextBody(
        "Благодарим ти! Получихме заявката ти за 3 целеви аудитории.",
        delivery.testMode,
        { originalTo: input.email },
      ),
      html: withTestHtmlBody(customerHtml, delivery.testMode, { originalTo: input.email }),
    }),
    transporter.sendMail({
      from: withTestFrom(from, delivery.testMode),
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(adminText, delivery.testMode, { originalTo: notifyEmail }),
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: notifyEmail }),
    }),
  ]);

  if (sends.some((result) => result.status === "rejected")) {
    throw new Error("One or more target audience emails failed to send.");
  }
}
