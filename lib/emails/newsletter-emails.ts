import nodemailer from "nodemailer";
import React from "react";
import { google } from "googleapis";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

/** Aligns with app/globals.css light theme: white bg, slate text, electric blue accent */
const colors = {
  pageBg: "#f1f5f9",
  cardBg: "#ffffff",
  foreground: "#0f172a",
  muted: "#64748b",
  primary: "#2563eb",
  primaryFg: "#ffffff",
  border: "#e2e8f0",
  accentSoft: "#eff6ff",
} as const;

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

function formatBgDate(d: Date) {
  return d.toLocaleString("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });
}

async function renderSubscriberEmailHtml(params: { email: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";

  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(
        Preview,
        null,
        "Потвърждаваме записването ви за бюлетина на DigiStart",
      ),
      React.createElement(
        Body,
        {
          style: {
            backgroundColor: colors.pageBg,
            fontFamily:
              'Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
            margin: 0,
            padding: "32px 16px",
          },
        },
        React.createElement(
          Container,
          {
            style: {
              margin: "0 auto",
              maxWidth: "560px",
              backgroundColor: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            },
          },
          React.createElement(
            Section,
            {
              style: {
                background: `linear-gradient(135deg, ${colors.accentSoft} 0%, ${colors.cardBg} 55%)`,
                padding: "28px 28px 20px",
              },
            },
            React.createElement(
              Text,
              {
                style: {
                  margin: "0 0 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.primary,
                },
              },
              "DigiStart",
            ),
            React.createElement(
              Heading,
              {
                as: "h1",
                style: {
                  margin: "0",
                  fontSize: "24px",
                  lineHeight: "1.25",
                  color: colors.foreground,
                  fontWeight: 800,
                },
              },
              "Благодарим, че се записахте!",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "16px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              `Записахме имейла ви: ${params.email}. При старта ще получите 10% ексклузивна отстъпка за първата си услуга при нас.`,
            ),
          ),
          React.createElement(
            Section,
            { style: { padding: "0 28px 24px" } },
            React.createElement(
              Button,
              {
                href: siteUrl,
                style: {
                  backgroundColor: colors.primary,
                  color: colors.primaryFg,
                  borderRadius: "8px",
                  padding: "12px 22px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-block",
                },
              },
              "DigiStart",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "20px 0 0",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Ако не сте заявили този бюлетин, можете спокойно да игнорирате този имейл.",
            ),
          ),
          React.createElement(Hr, { style: { borderColor: colors.border, margin: "0" } }),
          React.createElement(
            Section,
            { style: { padding: "16px 28px 24px" } },
            React.createElement(
              Text,
              { style: { margin: "0", fontSize: "12px", color: colors.muted } },
              React.createElement(Link, { href: siteUrl, style: { color: colors.primary } }, siteUrl),
            ),
          ),
        ),
      ),
    ),
  );
}

async function renderAdminEmailHtml(params: {
  email: string;
  source: string;
  subscribedAt: Date;
}) {
  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нов бюлетин абонамент: ${params.email}`),
      React.createElement(
        Body,
        {
          style: {
            backgroundColor: colors.pageBg,
            fontFamily:
              'Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
            margin: 0,
            padding: "32px 16px",
          },
        },
        React.createElement(
          Container,
          {
            style: {
              margin: "0 auto",
              maxWidth: "560px",
              backgroundColor: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              padding: "28px",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            },
          },
          React.createElement(
            Heading,
            {
              as: "h1",
              style: {
                margin: "0 0 16px",
                fontSize: "22px",
                color: colors.foreground,
              },
            },
            "Нов абонамент за бюлетин",
          ),
          React.createElement(
            Section,
            {
              style: {
                backgroundColor: colors.accentSoft,
                borderRadius: "8px",
                padding: "16px",
                border: `1px solid ${colors.border}`,
              },
            },
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Имейл: "),
              params.email,
            ),
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Източник: "),
              params.source,
            ),
            React.createElement(
              Text,
              { style: { margin: "0", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Дата: "),
              formatBgDate(params.subscribedAt),
            ),
          ),
          React.createElement(Hr, { style: { borderColor: colors.border, margin: "24px 0" } }),
          React.createElement(
            Text,
            { style: { margin: "0", fontSize: "12px", color: colors.muted } },
            "DigiStart Admin",
          ),
        ),
      ),
    ),
  );
}

export async function sendNewsletterSignupEmails(params: {
  email: string;
  source: string;
  subscribedAt: Date;
}): Promise<void> {
  const from = resolveFromAddress();
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.admin_email;
  const mailer = await createOAuth2Transporter();

  if (!from || !adminEmail || !mailer) {
    throw new Error("Email is not configured (OAuth2 transporter, SMTP_FROM, or ADMIN_EMAIL).");
  }

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: params.email,
    adminEmail,
  });
  const mailFrom = withTestFrom(from, delivery.testMode);

  const subscriberHtml = await renderSubscriberEmailHtml({ email: params.email });
  const adminHtml = await renderAdminEmailHtml({
    email: params.email,
    source: params.source,
    subscribedAt: params.subscribedAt,
  });

  const subscriberSubject = withTestSubject(
    "Благодарим за записването в бюлетина - DigiStart",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    `Нов бюлетин абонамент: ${params.email}`,
    delivery.testMode,
  );

  const results = await Promise.allSettled([
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: subscriberSubject,
      text: withTestTextBody(
        `Здравейте,\n\nПотвърждаваме записването ви за бюлетина на DigiStart (${params.email}). При старта ще получите 10% ексклузивна отстъпка за първата си услуга при нас - детайлите изпращаме със старта.\n\nПоздрави,\nDigiStart`,
        delivery.testMode,
        { originalTo: params.email },
      ),
      html: withTestHtmlBody(subscriberHtml, delivery.testMode, {
        originalTo: params.email,
      }),
    }),
    mailer.sendMail({
      from: mailFrom,
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(
        `Нов абонамент за бюлетин.\nИмейл: ${params.email}\nИзточник: ${params.source}\nДата: ${formatBgDate(params.subscribedAt)}`,
        delivery.testMode,
        { originalTo: adminEmail },
      ),
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
    }),
  ]);

  if (results.some((r) => r.status === "rejected")) {
    throw new Error("One or more newsletter emails failed to send.");
  }
}

async function renderNicheRecommendationSubscriberEmailHtml(params: {
  email: string;
  niche: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";
  const templatesUrl = `${siteUrl}/templates`;

  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(
        Preview,
        null,
        `Записахме препоръката ви за ниша „${params.niche}"`,
      ),
      React.createElement(
        Body,
        {
          style: {
            backgroundColor: colors.pageBg,
            fontFamily:
              'Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
            margin: 0,
            padding: "32px 16px",
          },
        },
        React.createElement(
          Container,
          {
            style: {
              margin: "0 auto",
              maxWidth: "560px",
              backgroundColor: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            },
          },
          React.createElement(
            Section,
            {
              style: {
                background: `linear-gradient(135deg, ${colors.accentSoft} 0%, ${colors.cardBg} 55%)`,
                padding: "28px 28px 20px",
              },
            },
            React.createElement(
              Text,
              {
                style: {
                  margin: "0 0 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.primary,
                },
              },
              "DigiStart",
            ),
            React.createElement(
              Heading,
              {
                as: "h1",
                style: {
                  margin: "0",
                  fontSize: "24px",
                  lineHeight: "1.25",
                  color: colors.foreground,
                  fontWeight: 800,
                },
              },
              "Записахме препоръката ви!",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "16px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              `Препоръчахте ниша: `,
              React.createElement("strong", null, params.niche),
              `. Ще ви уведомим на ${params.email}, когато пуснем шаблони за нея. При старта ще получите 10% ексклузивна отстъпка за първата си услуга при нас.`,
            ),
          ),
          React.createElement(
            Section,
            { style: { padding: "0 28px 24px" } },
            React.createElement(
              Button,
              {
                href: templatesUrl,
                style: {
                  backgroundColor: colors.primary,
                  color: colors.primaryFg,
                  borderRadius: "8px",
                  padding: "12px 22px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-block",
                },
              },
              "Към шаблоните",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "20px 0 0",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Ако не сте изпратили тази препоръка, можете спокойно да игнорирате този имейл.",
            ),
          ),
          React.createElement(Hr, { style: { borderColor: colors.border, margin: "0" } }),
          React.createElement(
            Section,
            { style: { padding: "16px 28px 24px" } },
            React.createElement(
              Text,
              { style: { margin: "0", fontSize: "12px", color: colors.muted } },
              React.createElement(Link, { href: siteUrl, style: { color: colors.primary } }, siteUrl),
            ),
          ),
        ),
      ),
    ),
  );
}

async function renderNicheRecommendationAdminEmailHtml(params: {
  email: string;
  niche: string;
  submittedAt: Date;
  isNewSubscriber: boolean;
}) {
  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нова препоръка за ниша: ${params.niche}`),
      React.createElement(
        Body,
        {
          style: {
            backgroundColor: colors.pageBg,
            fontFamily:
              'Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
            margin: 0,
            padding: "32px 16px",
          },
        },
        React.createElement(
          Container,
          {
            style: {
              margin: "0 auto",
              maxWidth: "560px",
              backgroundColor: colors.cardBg,
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              padding: "28px",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            },
          },
          React.createElement(
            Heading,
            {
              as: "h1",
              style: {
                margin: "0 0 16px",
                fontSize: "22px",
                color: colors.foreground,
              },
            },
            "Нова препоръка за ниша",
          ),
          React.createElement(
            Section,
            {
              style: {
                backgroundColor: colors.accentSoft,
                borderRadius: "8px",
                padding: "16px",
                border: `1px solid ${colors.border}`,
              },
            },
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Ниша: "),
              params.niche,
            ),
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Имейл: "),
              params.email,
            ),
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Дата: "),
              formatBgDate(params.submittedAt),
            ),
            React.createElement(
              Text,
              { style: { margin: "0 0 8px", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Отстъпка: "),
              "10% при пускане на нишата",
            ),
            React.createElement(
              Text,
              { style: { margin: "0", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Нов абонат: "),
              params.isNewSubscriber ? "Да" : "Не (съществуващ имейл)",
            ),
          ),
          React.createElement(Hr, { style: { borderColor: colors.border, margin: "24px 0" } }),
          React.createElement(
            Text,
            { style: { margin: "0", fontSize: "12px", color: colors.muted } },
            "DigiStart Admin",
          ),
        ),
      ),
    ),
  );
}

function resolveNicheRecommendationAdminEmail(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ||
    process.env.GOOGLE_EMAIL_USER ||
    process.env.ADMIN_EMAIL ||
    process.env.admin_email
  );
}

export async function sendNicheRecommendationEmails(params: {
  email: string;
  niche: string;
  submittedAt: Date;
  isNewSubscriber: boolean;
}): Promise<void> {
  const from = resolveFromAddress();
  const adminEmail = resolveNicheRecommendationAdminEmail();
  const mailer = await createOAuth2Transporter();

  if (!from || !adminEmail || !mailer) {
    throw new Error(
      "Email is not configured (OAuth2 transporter, SMTP_FROM, or NEXT_PUBLIC_GOOGLE_EMAIL_USER).",
    );
  }

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: params.email,
    adminEmail,
  });
  const mailFrom = withTestFrom(from, delivery.testMode);

  const subscriberHtml = await renderNicheRecommendationSubscriberEmailHtml({
    email: params.email,
    niche: params.niche,
  });
  const adminHtml = await renderNicheRecommendationAdminEmailHtml({
    email: params.email,
    niche: params.niche,
    submittedAt: params.submittedAt,
    isNewSubscriber: params.isNewSubscriber,
  });

  const subscriberSubject = withTestSubject(
    "Записахме препоръката ви за ниша - DigiStart",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    `Нова препоръка за ниша: ${params.niche}`,
    delivery.testMode,
  );

  const results = await Promise.allSettled([
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: subscriberSubject,
      text: withTestTextBody(
        `Здравейте,\n\nЗаписахме препоръката ви за ниша „${params.niche}" (${params.email}). Ще ви уведомим, когато пуснем шаблони за нея, и ще получите 10% ексклузивна отстъпка за първата си услуга при нас.\n\nПоздрави,\nDigiStart`,
        delivery.testMode,
        { originalTo: params.email },
      ),
      html: withTestHtmlBody(subscriberHtml, delivery.testMode, {
        originalTo: params.email,
      }),
    }),
    mailer.sendMail({
      from: mailFrom,
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(
        `Нова препоръка за ниша.\nНиша: ${params.niche}\nИмейл: ${params.email}\nДата: ${formatBgDate(params.submittedAt)}\nОтстъпка: 10% при пускане\nНов абонат: ${params.isNewSubscriber ? "Да" : "Не"}`,
        delivery.testMode,
        { originalTo: adminEmail },
      ),
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
    }),
  ]);

  if (results.some((r) => r.status === "rejected")) {
    throw new Error("One or more niche recommendation emails failed to send.");
  }
}
