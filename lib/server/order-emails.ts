import nodemailer from "nodemailer";
import React from "react";
import { google } from "googleapis";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

async function renderCustomerEmailHtml(params: {
  customerFirstName: string;
  orderId: string;
}) {
  return await render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, "Поръчката ви е потвърдена - DigiStart"),
      React.createElement(
        Body,
        { style: { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" } },
        React.createElement(
          Container,
          {
            style: {
              margin: "24px auto",
              padding: "24px",
              maxWidth: "560px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            },
          },
          React.createElement(Heading, { style: { marginTop: 0 } }, "Плащането е успешно"),
          React.createElement(
            Text,
            null,
            `Здравейте, ${params.customerFirstName},`
          ),
          React.createElement(
            Text,
            null,
            `Плащането по поръчка ${params.orderId} е успешно. Създадохме ваш клиентски профил автоматично и можете да следите статуса от панела си.`
          ),
          React.createElement(Hr),
          React.createElement(Text, { style: { color: "#6b7280", fontSize: "12px" } }, "Поздрави,"),
          React.createElement(Text, { style: { marginTop: 0 } }, "DigiStart")
        )
      )
    )
  );
}

async function renderAdminEmailHtml(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
}) {
  return await render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нова платена поръчка: ${params.orderId}`),
      React.createElement(
        Body,
        { style: { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" } },
        React.createElement(
          Container,
          {
            style: {
              margin: "24px auto",
              padding: "24px",
              maxWidth: "560px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            },
          },
          React.createElement(Heading, { style: { marginTop: 0 } }, "Нова платена поръчка"),
          React.createElement(
            Section,
            null,
            React.createElement(Text, null, `Поръчка: ${params.orderId}`),
            React.createElement(Text, null, `Клиент: ${params.customerName}`),
            React.createElement(Text, null, `Имейл: ${params.customerEmail}`)
          )
        )
      )
    )
  );
}

export async function sendGuestOrderSuccessEmails(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
}) {
  const gmailUserCandidatePairs = [
    ["NEXT_PUBLIC_GOOGLE_EMAIL_USER", process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER],
    ["GOOGLE_EMAIL_USER", process.env.GOOGLE_EMAIL_USER],
    ["GMAIL_USER", process.env.GMAIL_USER],
    ["SMTP_USER", process.env.SMTP_USER],
    ["NEXT_PUBLIC_EMAIL_SEND", process.env.NEXT_PUBLIC_EMAIL_SEND],
    ["ADMIN_EMAIL", process.env.ADMIN_EMAIL],
    ["admin_email", process.env.admin_email],
    ["CONSULTATION_NOTIFY_EMAIL", process.env.CONSULTATION_NOTIFY_EMAIL],
  ] as const;
  const chosenGmailUserPair = gmailUserCandidatePairs.find(([, value]) => Boolean(value));
  const gmailUser = chosenGmailUserPair?.[1];
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.REDIRECT_URI;
  const canUseOauth2 =
    Boolean(gmailUser) &&
    Boolean(googleClientId) &&
    Boolean(googleClientSecret) &&
    Boolean(googleRefreshToken) &&
    Boolean(redirectUri);
  const from = process.env.SMTP_FROM ?? (gmailUser ? `DigiStart <${gmailUser}>` : undefined);
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.admin_email;

  if (!canUseOauth2 || !from || !adminEmail) return;

  const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri
  );
  oauth2Client.setCredentials({
    refresh_token: googleRefreshToken,
  });
  const accessToken = await oauth2Client.getAccessToken();
  const mailer = nodemailer.createTransport({
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
  const customerFirstName = params.customerName.trim().split(" ")[0] || "клиент";
  const customerHtml = await renderCustomerEmailHtml({
    customerFirstName,
    orderId: params.orderId,
  });
  const adminHtml = await renderAdminEmailHtml({
    orderId: params.orderId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
  });

  try {
    const sendResults = await Promise.allSettled([
      mailer.sendMail({
        from,
        to: params.customerEmail,
        subject: "Поръчката ви е потвърдена - DigiStart",
        text: `Здравейте, ${customerFirstName},\n\nПлащането по поръчка ${params.orderId} е успешно.\nСъздадохме ваш клиентски профил автоматично и можете да следите статуса от панела си.\n\nПоздрави,\nDigiStart`,
        html: customerHtml,
      }),
      mailer.sendMail({
        from,
        to: adminEmail,
        subject: `Нова платена поръчка: ${params.orderId}`,
        text: `Има нова платена поръчка от guest checkout.\n\nПоръчка: ${params.orderId}\nКлиент: ${params.customerName}\nИмейл: ${params.customerEmail}`,
        html: adminHtml,
      }),
    ]);
    if (sendResults.some((result) => result.status === "rejected")) {
      throw new Error("One or more email sends failed.");
    }
  } catch (error) {
    throw error;
  }
}
