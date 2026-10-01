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
import { getUnsubscribePageUrl } from "@/lib/emails/unsubscribe";

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

function getSiteDisplayLabel(siteUrl: string) {
  try {
    const host = new URL(siteUrl).hostname;
    if (host === "localhost" || host === "127.0.0.1") return "digistart.bg";
    return host.replace(/^www\./, "");
  } catch {
    return "digistart.bg";
  }
}

function renderCustomerEmailFooter(siteUrl: string, uid: string) {
  const unsubscribeUrl = getUnsubscribePageUrl(uid);
  const siteLabel = getSiteDisplayLabel(siteUrl);
  return [
    React.createElement(Hr, {
      key: "footer-hr",
      style: { borderColor: colors.border, margin: "0" },
    }),
    React.createElement(
      Section,
      { key: "footer-section", style: { padding: "16px 28px 24px", textAlign: "center" as const } },
      React.createElement(
        Text,
        { style: { margin: "0 0 10px", fontSize: "12px", color: colors.muted } },
        React.createElement(Link, { href: siteUrl, style: { color: colors.primary } }, siteLabel),
      ),
      React.createElement(
        Text,
        {
          style: {
            margin: "0 0 12px",
            fontSize: "12px",
            lineHeight: "1.5",
            color: colors.muted,
          },
        },
        "Не желаете да получавате повече имейли?",
      ),
      React.createElement(
        Button,
        {
          href: unsubscribeUrl,
          style: {
            backgroundColor: "#ffffff",
            color: colors.foreground,
            borderRadius: "8px",
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "13px",
            textDecoration: "none",
            display: "inline-block",
            border: `1px solid ${colors.border}`,
          },
        },
        "Отпиши ме",
      ),
    ),
  ];
}

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

export async function renderNicheRecommendationSubscriberEmailHtml(params: {
  email: string;
  uid: string;
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
          ...renderCustomerEmailFooter(siteUrl, params.uid),
        ),
      ),
    ),
  );
}

export async function renderNicheRecommendationAdminEmailHtml(params: {
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
  uid: string;
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
    uid: params.uid,
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

function renderConsultationNextStepSection(
  consultationUrl: string,
  options?: {
    buttonVariant?: "primary" | "secondary";
    eyebrow?: string;
  },
) {
  const buttonVariant = options?.buttonVariant ?? "primary";
  const eyebrow = options?.eyebrow ?? "Следваща стъпка";
  const buttonStyle =
    buttonVariant === "secondary"
      ? {
          backgroundColor: "#ffffff",
          color: colors.foreground,
          borderRadius: "8px",
          padding: "12px 20px",
          fontWeight: 700,
          fontSize: "14px",
          textDecoration: "none",
          display: "inline-block",
          border: `1px solid ${colors.border}`,
        }
      : {
          backgroundColor: colors.primary,
          color: colors.primaryFg,
          borderRadius: "8px",
          padding: "13px 22px",
          fontWeight: 700,
          fontSize: "14px",
          textDecoration: "none",
          display: "inline-block",
        };

  return React.createElement(
    Section,
    {
      style: {
        backgroundColor: colors.accentSoft,
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        padding: "20px 20px 22px",
      },
    },
    React.createElement(
      Text,
      {
        style: {
          margin: "0 0 6px",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: buttonVariant === "secondary" ? colors.muted : colors.primary,
        },
      },
      eyebrow,
    ),
    React.createElement(
      Text,
      {
        style: {
          margin: "0 0 16px",
          fontSize: "15px",
          lineHeight: "1.6",
          color: colors.foreground,
        },
      },
      CONSULTATION_NEXT_STEP_LEAD,
    ),
    React.createElement(
      Button,
      {
        href: consultationUrl,
        style: buttonStyle,
      },
      CONSULTATION_NEXT_STEP_CTA_LABEL,
    ),
  );
}

const CONSULTATION_NEXT_STEP_LEAD =
  "Ако желаете да поговорим за бизнеса Ви и да намерим най-доброто решение за Вас:";
const CONSULTATION_NEXT_STEP_CTA_LABEL = "Запази безплатна консултация";

export async function renderThreeFreeTipsSubscriberEmailHtml(params: {
  videoUrl: string;
  uid: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";
  const videoUrl = params.videoUrl;
  const consultationUrl = `${siteUrl}/business-consultation`;

  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(
        Preview,
        null,
        "Вашите 3 безплатни съвета за Google са готови - гледайте клипа.",
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
            { style: { padding: "28px 28px 8px" } },
            React.createElement(
              Text,
              {
                style: {
                  margin: "0 0 20px",
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
                  margin: "0 0 10px",
                  fontSize: "24px",
                  lineHeight: "1.3",
                  color: colors.foreground,
                  fontWeight: 800,
                },
              },
              "Вашите 3 безплатни съвета са готови",
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "0 0 24px",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Обещахме Ви кратко видео с практически съвети за по-добро класиране в Google. Ето го:",
            ),
            React.createElement(
              Section,
              {
                style: {
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: `1px solid ${colors.border}`,
                  padding: "20px",
                  marginBottom: "16px",
                },
              },
              React.createElement(
                Text,
                {
                  style: {
                    margin: "0 0 8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: colors.muted,
                  },
                },
                "Стъпка 1 · Гледайте клипа",
              ),
              React.createElement(
                Text,
                {
                  style: {
                    margin: "0 0 16px",
                    fontSize: "15px",
                    lineHeight: "1.55",
                    color: colors.foreground,
                  },
                },
                "Три съвета, които можете да приложите още днес.",
              ),
              React.createElement(
                Button,
                {
                  href: videoUrl,
                  style: {
                    backgroundColor: colors.primary,
                    color: colors.primaryFg,
                    borderRadius: "8px",
                    padding: "14px 24px",
                    fontWeight: 700,
                    fontSize: "15px",
                    textDecoration: "none",
                    display: "inline-block",
                  },
                },
                "Гледай клипа",
              ),
            ),
            renderConsultationNextStepSection(consultationUrl, {
              buttonVariant: "secondary",
              eyebrow: "Стъпка 2 · По желание",
            }),
            React.createElement(
              Text,
              {
                style: {
                  margin: "24px 0 8px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Поздрави,",
              React.createElement("br"),
              React.createElement(
                "strong",
                { style: { color: colors.foreground } },
                "Екипът на DigiStart",
              ),
            ),
          ),
          ...renderCustomerEmailFooter(siteUrl, params.uid),
        ),
      ),
    ),
  );
}

export async function renderThreeFreeTipsAdminEmailHtml(params: {
  email: string;
  source: string;
  subscribedAt: Date;
}) {
  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нов абонамент: 3 безплатни съвета - ${params.email}`),
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
            "Нов абонамент: 3 безплатни съвета",
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

export async function sendThreeFreeTipsEmails(params: {
  email: string;
  uid: string;
  source: string;
  subscribedAt: Date;
  notifyAdmin: boolean;
}): Promise<void> {
  const { getThreeFreeTipsVideoUrl } = await import("@/lib/server/app-settings");
  const videoUrl = await getThreeFreeTipsVideoUrl();

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

  const subscriberHtml = await renderThreeFreeTipsSubscriberEmailHtml({
    videoUrl,
    uid: params.uid,
  });
  const subscriberSubject = withTestSubject(
    "3 безплатни съвета за Google - DigiStart",
    delivery.testMode,
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";
  const subscriberText = `Заповядайте, това е обещаният клип с безплатни 3 съвета\n\nГледай клипа: ${videoUrl}\n\n${CONSULTATION_NEXT_STEP_LEAD}\n${CONSULTATION_NEXT_STEP_CTA_LABEL}: ${siteUrl}/business-consultation\n\nПоздрави,\nDigiStart`;

  const sends: Promise<unknown>[] = [
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: subscriberSubject,
      text: withTestTextBody(subscriberText, delivery.testMode, {
        originalTo: params.email,
      }),
      html: withTestHtmlBody(subscriberHtml, delivery.testMode, {
        originalTo: params.email,
      }),
    }),
  ];

  if (params.notifyAdmin) {
    const adminHtml = await renderThreeFreeTipsAdminEmailHtml({
      email: params.email,
      source: params.source,
      subscribedAt: params.subscribedAt,
    });
    const adminSubject = withTestSubject(
      `Нов абонамент: 3 безплатни съвета - ${params.email}`,
      delivery.testMode,
    );

    sends.push(
      mailer.sendMail({
        from: mailFrom,
        to: delivery.adminTo,
        subject: adminSubject,
        text: withTestTextBody(
          `Нов абонамент за 3 безплатни съвета.\nИмейл: ${params.email}\nИзточник: ${params.source}\nДата: ${formatBgDate(params.subscribedAt)}`,
          delivery.testMode,
          { originalTo: adminEmail },
        ),
        html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
      }),
    );
  }

  const results = await Promise.allSettled(sends);

  if (results.some((r) => r.status === "rejected")) {
    throw new Error("One or more three free tips emails failed to send.");
  }
}

const GOOGLE_NEWSLETTER_SUBSCRIBER_MESSAGE =
  "Успешно се записахте за нашият бюлетин.";

export async function renderGoogleNewsletterSubscriberEmailHtml(params: {
  firstName: string;
  uid: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";
  const consultationUrl = `${siteUrl}/business-consultation`;
  const greeting = params.firstName ? `Здравейте, ${params.firstName}!` : "Здравейте!";

  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(
        Preview,
        null,
        `${GOOGLE_NEWSLETTER_SUBSCRIBER_MESSAGE} Запазете безплатна консултация.`,
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
                background: `linear-gradient(160deg, ${colors.accentSoft} 0%, ${colors.cardBg} 70%)`,
                padding: "28px 28px 8px",
              },
            },
            React.createElement(
              Text,
              {
                style: {
                  margin: "0 0 18px",
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
              Text,
              {
                style: {
                  margin: "0 0 14px",
                  display: "inline-block",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  borderRadius: "999px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                },
              },
              "✓ Абонаментът е активен",
            ),
            React.createElement(
              Heading,
              {
                as: "h1",
                style: {
                  margin: "0 0 8px",
                  fontSize: "26px",
                  lineHeight: "1.25",
                  color: colors.foreground,
                  fontWeight: 800,
                },
              },
              greeting,
            ),
            React.createElement(
              Text,
              {
                style: {
                  margin: "0",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: colors.foreground,
                  fontWeight: 500,
                },
              },
              GOOGLE_NEWSLETTER_SUBSCRIBER_MESSAGE,
            ),
          ),
          React.createElement(
            Section,
            { style: { padding: "20px 28px 8px" } },
            renderConsultationNextStepSection(consultationUrl),
          ),
          React.createElement(
            Section,
            { style: { padding: "20px 28px 8px" } },
            React.createElement(
              Text,
              {
                style: {
                  margin: "0",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: colors.muted,
                },
              },
              "Поздрави,",
              React.createElement("br"),
              React.createElement("strong", { style: { color: colors.foreground } }, "Екипът на DigiStart"),
            ),
          ),
          ...renderCustomerEmailFooter(siteUrl, params.uid),
        ),
      ),
    ),
  );
}

export async function renderGoogleNewsletterAdminEmailHtml(params: {
  email: string;
  firstName: string;
  source: string;
  subscribedAt: Date;
}) {
  return render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нов абонамент за Google бюлетин: ${params.email}`),
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
            "Нов абонамент за Google бюлетин",
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
              params.firstName,
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

export async function sendGoogleNewsletterEmails(params: {
  email: string;
  uid: string;
  firstName: string;
  source: string;
  subscribedAt: Date;
  notifyAdmin: boolean;
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

  const subscriberHtml = await renderGoogleNewsletterSubscriberEmailHtml({
    firstName: params.firstName,
    uid: params.uid,
  });
  const subscriberSubject = withTestSubject(
    "Успешно записахте за бюлетина - DigiStart",
    delivery.testMode,
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg";
  const subscriberText = `${params.firstName ? `Здравейте, ${params.firstName}!\n\n` : "Здравейте!\n\n"}${GOOGLE_NEWSLETTER_SUBSCRIBER_MESSAGE}\n\n${CONSULTATION_NEXT_STEP_LEAD}\n${CONSULTATION_NEXT_STEP_CTA_LABEL}: ${siteUrl}/business-consultation\n\nПоздрави,\nЕкипът на DigiStart`;

  const sends: Promise<unknown>[] = [
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: subscriberSubject,
      text: withTestTextBody(subscriberText, delivery.testMode, {
        originalTo: params.email,
      }),
      html: withTestHtmlBody(subscriberHtml, delivery.testMode, {
        originalTo: params.email,
      }),
    }),
  ];

  if (params.notifyAdmin) {
    const adminHtml = await renderGoogleNewsletterAdminEmailHtml({
      email: params.email,
      firstName: params.firstName,
      source: params.source,
      subscribedAt: params.subscribedAt,
    });
    const adminSubject = withTestSubject(
      `Нов абонамент за Google бюлетин - ${params.email}`,
      delivery.testMode,
    );

    sends.push(
      mailer.sendMail({
        from: mailFrom,
        to: delivery.adminTo,
        subject: adminSubject,
        text: withTestTextBody(
          `Нов абонамент за Google бюлетин.\nИме: ${params.firstName}\nИмейл: ${params.email}\nИзточник: ${params.source}\nДата: ${formatBgDate(params.subscribedAt)}`,
          delivery.testMode,
          { originalTo: adminEmail },
        ),
        html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
      }),
    );
  }

  const results = await Promise.allSettled(sends);

  if (results.some((r) => r.status === "rejected")) {
    throw new Error("One or more google newsletter emails failed to send.");
  }
}
