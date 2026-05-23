import { google } from "googleapis";
import nodemailer from "nodemailer";
import type { SupportChat, SupportMessage, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderSupportChatAdminEmailHtml } from "@/lib/emails/support-chat-emails";
import {
  resolveOutboundEmailDelivery,
  withTestFrom,
  withTestHtmlBody,
  withTestSubject,
  withTestTextBody,
} from "@/lib/server/email-test";
import {
  SUPPORT_ADMIN_JOINED_MESSAGE,
  SUPPORT_AUTO_REPLY_MESSAGE,
  SUPPORT_CHAT_STATUS_CLOSED,
  SUPPORT_CHAT_STATUS_OPEN,
  SUPPORT_MESSAGE_MAX_LENGTH,
  SUPPORT_SENDER_ADMIN,
  SUPPORT_SENDER_SYSTEM,
  SUPPORT_SENDER_USER,
} from "@/lib/support-chat/constants";

export type SupportChatWithMessages = SupportChat & {
  messages: SupportMessage[];
  user?: Pick<User, "id" | "name" | "email">;
};

export class SupportChatError extends Error {
  constructor(
    message: string,
    readonly code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "CHAT_CLOSED"
      | "OPEN_CHAT_EXISTS"
      | "INVALID_BODY",
  ) {
    super(message);
    this.name = "SupportChatError";
  }
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAdminSupportChatUrl(chatId: string): string {
  return `${getSiteUrl()}/admin/support/${chatId}`;
}

export type SupportChatListItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminJoinedAt: string | null;
  adminNotifiedAt: string | null;
  user: { id: string; name: string | null; email: string };
  problemPreview: string | null;
};

export async function listSupportChatsForAdmin(): Promise<SupportChatListItem[]> {
  const chats = await prisma.supportChat.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        where: { senderType: SUPPORT_SENDER_USER },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return chats.map((chat) => ({
    id: chat.id,
    status: chat.status,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    adminJoinedAt: chat.adminJoinedAt?.toISOString() ?? null,
    adminNotifiedAt: chat.adminNotifiedAt?.toISOString() ?? null,
    user: {
      id: chat.user.id,
      name: chat.user.name,
      email: chat.user.email,
    },
    problemPreview: chat.messages[0]?.body ?? null,
  }));
}

async function getMailer() {
  const gmailUser =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ??
    process.env.GOOGLE_EMAIL_USER ??
    process.env.GMAIL_USER ??
    process.env.SMTP_USER;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const redirectUri = process.env.REDIRECT_URI;
  if (!gmailUser || !googleClientId || !googleClientSecret || !googleRefreshToken || !redirectUri) {
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

export function assertSupportChatAccess(
  chat: SupportChat,
  userId: string,
  role: string,
): void {
  if (role === "admin") return;
  if (chat.userId !== userId) {
    throw new SupportChatError("Forbidden", "FORBIDDEN");
  }
}

export async function listSupportChatsForUser(
  userId: string,
  role: string,
): Promise<SupportChatWithMessages[]> {
  const where = role === "admin" ? {} : { userId };
  const chats = await prisma.supportChat.findMany({
    where,
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return chats;
}

export async function getOpenSupportChatForUser(userId: string): Promise<SupportChat | null> {
  return prisma.supportChat.findFirst({
    where: { userId, status: SUPPORT_CHAT_STATUS_OPEN },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSupportChat(userId: string): Promise<SupportChat> {
  const existing = await getOpenSupportChatForUser(userId);
  if (existing) {
    throw new SupportChatError("Open chat already exists", "OPEN_CHAT_EXISTS");
  }
  return prisma.supportChat.create({
    data: { userId, status: SUPPORT_CHAT_STATUS_OPEN },
  });
}

export async function getSupportChatById(
  chatId: string,
  userId: string,
  role: string,
): Promise<SupportChatWithMessages> {
  const chat = await prisma.supportChat.findUnique({
    where: { id: chatId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!chat) {
    throw new SupportChatError("Chat not found", "NOT_FOUND");
  }
  assertSupportChatAccess(chat, userId, role);
  return chat;
}

export async function closeSupportChat(
  chatId: string,
  userId: string,
  role: string,
): Promise<SupportChat> {
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    throw new SupportChatError("Chat not found", "NOT_FOUND");
  }
  assertSupportChatAccess(chat, userId, role);
  if (chat.status === SUPPORT_CHAT_STATUS_CLOSED) {
    return chat;
  }
  return prisma.supportChat.update({
    where: { id: chatId },
    data: {
      status: SUPPORT_CHAT_STATUS_CLOSED,
      closedAt: new Date(),
    },
  });
}

async function sendSupportChatAdminEmail(params: {
  chatId: string;
  customerName: string;
  customerEmail: string;
  problemSummary: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.admin_email;
  if (!adminEmail) {
    console.warn("support-chat: ADMIN_EMAIL not configured");
    return;
  }

  const senderEmail =
    process.env.NEXT_PUBLIC_GOOGLE_EMAIL_USER ??
    process.env.GOOGLE_EMAIL_USER ??
    process.env.GMAIL_USER ??
    process.env.SMTP_USER;
  const from =
    process.env.SMTP_FROM ?? (senderEmail ? `DigiStart <${senderEmail}>` : undefined);
  if (!from) return;

  const mailer = await getMailer();
  if (!mailer) {
    console.warn("support-chat: email transporter not configured");
    return;
  }

  const chatUrl = getAdminSupportChatUrl(params.chatId);
  const html = await renderSupportChatAdminEmailHtml({
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    problemSummary: params.problemSummary,
    chatUrl,
  });

  const delivery = resolveOutboundEmailDelivery({
    customerEmail: params.customerEmail,
    adminEmail,
  });
  const mailFrom = withTestFrom(from, delivery.testMode);
  const subject = withTestSubject(
    `Нова заявка за помощ: ${params.customerName}`,
    delivery.testMode,
  );
  const text = `Клиент: ${params.customerName} (${params.customerEmail})\nПроблем: ${params.problemSummary}\nЧат: ${chatUrl}`;

  await mailer.sendMail({
    from: mailFrom,
    to: delivery.adminTo,
    subject,
    text: withTestTextBody(text, delivery.testMode),
    html: withTestHtmlBody(html, delivery.testMode),
  });
}

export async function addSupportMessage(params: {
  chatId: string;
  userId: string;
  role: string;
  body: string;
}): Promise<{ chat: SupportChatWithMessages; messages: SupportMessage[] }> {
  const trimmed = params.body.trim();
  if (!trimmed || trimmed.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    throw new SupportChatError("Invalid message body", "INVALID_BODY");
  }

  const chat = await prisma.supportChat.findUnique({
    where: { id: params.chatId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!chat) {
    throw new SupportChatError("Chat not found", "NOT_FOUND");
  }
  assertSupportChatAccess(chat, params.userId, params.role);
  if (chat.status === SUPPORT_CHAT_STATUS_CLOSED) {
    throw new SupportChatError("Chat is closed", "CHAT_CLOSED");
  }

  const senderType =
    params.role === "admin" ? SUPPORT_SENDER_ADMIN : SUPPORT_SENDER_USER;

  if (senderType === SUPPORT_SENDER_USER && chat.userId !== params.userId) {
    throw new SupportChatError("Forbidden", "FORBIDDEN");
  }

  const priorUserCount = await prisma.supportMessage.count({
    where: { chatId: params.chatId, senderType: SUPPORT_SENDER_USER },
  });
  const isFirstUserMessage = senderType === SUPPORT_SENDER_USER && priorUserCount === 0;

  const createdMessages: SupportMessage[] = [];

  const userMessage = await prisma.supportMessage.create({
    data: {
      chatId: params.chatId,
      senderType,
      senderUserId: params.userId,
      body: trimmed,
    },
  });
  createdMessages.push(userMessage);

  if (isFirstUserMessage) {
    const systemMessage = await prisma.supportMessage.create({
      data: {
        chatId: params.chatId,
        senderType: SUPPORT_SENDER_SYSTEM,
        body: SUPPORT_AUTO_REPLY_MESSAGE,
      },
    });
    createdMessages.push(systemMessage);

    if (!chat.adminNotifiedAt) {
      const customerName =
        chat.user?.name?.trim() || chat.user?.email || "Клиент";
      const customerEmail = chat.user?.email ?? "";
      try {
        await sendSupportChatAdminEmail({
          chatId: params.chatId,
          customerName,
          customerEmail,
          problemSummary: trimmed,
        });
        await prisma.supportChat.update({
          where: { id: params.chatId },
          data: { adminNotifiedAt: new Date() },
        });
      } catch (error) {
        console.error("support-chat: failed to send admin email", error);
      }
    }
  }

  await prisma.supportChat.update({
    where: { id: params.chatId },
    data: { updatedAt: new Date() },
  });

  const fullChat = await getSupportChatById(params.chatId, params.userId, params.role);
  return { chat: fullChat, messages: createdMessages };
}

export async function adminJoinSupportChat(
  chatId: string,
  adminUserId: string,
): Promise<{ chat: SupportChatWithMessages; joined: boolean }> {
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId } });
  if (!chat) {
    throw new SupportChatError("Chat not found", "NOT_FOUND");
  }

  if (chat.adminJoinedAt) {
    const fullChat = await getSupportChatById(chatId, adminUserId, "admin");
    return { chat: fullChat, joined: false };
  }

  await prisma.$transaction([
    prisma.supportChat.update({
      where: { id: chatId },
      data: { adminJoinedAt: new Date() },
    }),
    prisma.supportMessage.create({
      data: {
        chatId,
        senderType: SUPPORT_SENDER_SYSTEM,
        body: SUPPORT_ADMIN_JOINED_MESSAGE,
      },
    }),
  ]);

  const fullChat = await getSupportChatById(chatId, adminUserId, "admin");
  return { chat: fullChat, joined: true };
}

export function serializeSupportChat(chat: SupportChatWithMessages) {
  return {
    id: chat.id,
    userId: chat.userId,
    status: chat.status,
    adminJoinedAt: chat.adminJoinedAt?.toISOString() ?? null,
    adminNotifiedAt: chat.adminNotifiedAt?.toISOString() ?? null,
    closedAt: chat.closedAt?.toISOString() ?? null,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    user: chat.user
      ? {
          id: chat.user.id,
          name: chat.user.name,
          email: chat.user.email,
        }
      : null,
    messages: chat.messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderType: m.senderType,
      senderUserId: m.senderUserId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
