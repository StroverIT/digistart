import nodemailer from "nodemailer";
import React from "react";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
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
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";

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
            `Плащането по поръчка ${params.orderId} е успешно. Благодарим ви за доверието! Ще се свържем с вас при необходимост. Можете да следите статуса от клиентския панел.`
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

/**
 * Sends customer + admin paid-order emails once per order (Stripe webhook and success-page polling may overlap).
 * Uses an atomic DB claim so concurrent callers cannot all pass a "not sent yet" read before any stamps.
 * Requires Gmail OAuth env (same as newsletter): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN,
 * REDIRECT_URI, plus a Gmail user (e.g. GOOGLE_EMAIL_USER or SMTP_USER) and ADMIN_EMAIL for the admin copy.
 */
export async function trySendOrderPaidConfirmationEmails(orderId: string): Promise<void> {
  const claimed = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: "paid",
      paidConfirmationEmailsSentAt: null,
    },
    data: { paidConfirmationEmailsSentAt: new Date() },
  });
  if (claimed.count === 0) {
    return;
  }

  const row = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, customerName: true, customerEmail: true },
  });
  if (!row || row.status !== "paid") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paidConfirmationEmailsSentAt: null },
    });
    return;
  }

  try {
    await sendOrderPaidConfirmationEmails({
      orderId,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
    });
  } catch (err) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paidConfirmationEmailsSentAt: null },
    });
    throw err;
  }
}

export async function sendOrderPaidConfirmationEmails(params: {
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

  if (!canUseOauth2 || !from || !adminEmail) {
    const missing: string[] = [];
    if (!canUseOauth2) {
      if (!gmailUser) missing.push("GOOGLE_EMAIL_USER|GMAIL_USER|SMTP_USER|… (OAuth user)");
      if (!googleClientId) missing.push("GOOGLE_CLIENT_ID");
      if (!googleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
      if (!googleRefreshToken) missing.push("GOOGLE_REFRESH_TOKEN");
      if (!redirectUri) missing.push("REDIRECT_URI");
    }
    if (!from) missing.push("SMTP_FROM or OAuth user for From");
    if (!adminEmail) missing.push("ADMIN_EMAIL");
    console.error(
      `[order-emails] Paid order emails not sent (misconfigured): ${missing.join(", ") || "OAuth2"}`
    );
    throw new Error(`Order email transport not configured: ${missing.join(", ")}`);
  }

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
  const delivery = resolveOutboundEmailDelivery({
    customerEmail: params.customerEmail,
    adminEmail,
  });
  const mailFrom = withTestFrom(from, delivery.testMode);
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

  const customerSubject = withTestSubject(
    "Поръчката ви е потвърдена - DigiStart",
    delivery.testMode,
  );
  const adminSubject = withTestSubject(
    `Нова платена поръчка: ${params.orderId}`,
    delivery.testMode,
  );
  const customerText = withTestTextBody(
    `Здравейте, ${customerFirstName},\n\nПлащането по поръчка ${params.orderId} е успешно. Благодарим ви за доверието!\n\nПоздрави,\nDigiStart`,
    delivery.testMode,
    { originalTo: params.customerEmail },
  );
  const adminText = withTestTextBody(
    `Има нова платена поръчка.\n\nПоръчка: ${params.orderId}\nКлиент: ${params.customerName}\nИмейл: ${params.customerEmail}`,
    delivery.testMode,
    { originalTo: adminEmail },
  );

  const sendResults = await Promise.allSettled([
    mailer.sendMail({
      from: mailFrom,
      to: delivery.customerTo,
      subject: customerSubject,
      text: customerText,
      html: withTestHtmlBody(customerHtml, delivery.testMode, {
        originalTo: params.customerEmail,
      }),
    }),
    mailer.sendMail({
      from: mailFrom,
      to: delivery.adminTo,
      subject: adminSubject,
      text: adminText,
      html: withTestHtmlBody(adminHtml, delivery.testMode, { originalTo: adminEmail }),
    }),
  ]);
  if (sendResults.some((result) => result.status === "rejected")) {
    throw new Error("One or more email sends failed.");
  }
}
