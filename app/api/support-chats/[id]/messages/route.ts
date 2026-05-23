import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import {
  SupportChatError,
  addSupportMessage,
  serializeSupportChat,
} from "@/lib/server/support-chats";
import { SUPPORT_MESSAGE_MAX_LENGTH } from "@/lib/support-chat/constants";

const bodySchema = z.object({
  body: z.string().min(1).max(SUPPORT_MESSAGE_MAX_LENGTH),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await addSupportMessage({
      chatId: id,
      userId: session.userId,
      role: session.role,
      body: parsed.data.body,
    });
    return NextResponse.json({
      chat: serializeSupportChat(result.chat),
      messages: result.messages.map((m) => ({
        id: m.id,
        chatId: m.chatId,
        senderType: m.senderType,
        senderUserId: m.senderUserId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof SupportChatError) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "FORBIDDEN"
            ? 403
            : error.code === "CHAT_CLOSED"
              ? 409
              : error.code === "INVALID_BODY"
                ? 400
                : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("POST /api/support-chats/[id]/messages", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
