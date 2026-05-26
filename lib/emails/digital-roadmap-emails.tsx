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

async function renderSubscriberEmailHtml(params: { name: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";

  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(
        Preview,
        null,
        "Вашата безплатна дигитална пътна карта – DigiStart",
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
              `Здравейте, ${params.name}!`,
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
              "Благодарим ви, че заявихте безплатното ни ръководство за продажба на продукти онлайн.",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "12px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Ръководството вече е създадено и в момента го подобряваме, за да ви дадем най-полезните стъпки. Ще ви изпратим финалния PDF на този имейл, веднага щом е готов.",
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
              "Към DigiStart",
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
              "Ако не сте заявили това ръководство, можете спокойно да игнорирате този имейл.",
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
  name: string;
  email: string;
  source: string;
  createdAt: Date;
}) {
  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нова заявка за пътна карта: ${params.email}`),
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
            "Нова заявка за дигитална пътна карта",
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
              React.createElement("strong", null, "Име: "),
              params.name,
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
              React.createElement("strong", null, "Източник: "),
              params.source,
            ),
            React.createElement(
              Text,
              { style: { margin: "0", fontSize: "14px", color: colors.foreground } },
              React.createElement("strong", null, "Дата: "),
              formatBgDate(params.createdAt),
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

export async function sendDigitalRoadmapLeadEmails(params: {
  name: string;
  email: string;
  source: string;
  createdAt: Date;
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

  const subscriberHtml = await renderSubscriberEmailHtml({ name: params.name });
  const adminHtml = await renderAdminEmailHtml({
    name: params.name,
    email: params.email,
    source: params.source,
    createdAt: params.createdAt,
  });

  const subscriberSubject = withTestSubject(
    "Вашата дигитална пътна карта – DigiStart",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    `Нова заявка за пътна карта: ${params.email}`,
    delivery.testMode,
  );

  const subscriberText = `Здравейте, ${params.name},

Благодарим ви, че заявихте безплатното ни ръководство за продажба на продукти онлайн.

Ръководството вече е създадено и в момента го подобряваме. Ще ви изпратим финалния PDF на този имейл, веднага щом е готов.

Поздрави,
DigiStart`;

  const results = await Promise.allSettled([
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: subscriberSubject,
      text: withTestTextBody(subscriberText, delivery.testMode, { originalTo: params.email }),
      html: withTestHtmlBody(subscriberHtml, delivery.testMode, {
        originalTo: params.email,
      }),
    }),
    mailer.sendMail({
      from: mailFrom,
      to: delivery.adminTo,
      subject: adminSubject,
      text: withTestTextBody(
        `Нова заявка за дигитална пътна карта.\nИме: ${params.name}\nИмейл: ${params.email}\nИзточник: ${params.source}\nДата: ${formatBgDate(params.createdAt)}`,
        delivery.testMode,
        { originalTo: adminEmail },
      ),
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
    }),
  ]);

  if (results.some((r) => r.status === "rejected")) {
    throw new Error("One or more digital roadmap emails failed to send.");
  }
}
