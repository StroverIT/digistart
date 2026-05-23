import { NextResponse } from "next/server";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import {
  SupportChatError,
  createSupportChat,
  getOpenSupportChatForUser,
  listSupportChatsForUser,
  serializeSupportChat,
} from "@/lib/server/support-chats";

export async function GET() {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chats = await listSupportChatsForUser(session.userId, session.role);
    const openChat =
      session.role === "customer"
        ? await getOpenSupportChatForUser(session.userId)
        : null;
    return NextResponse.json({
      chats: chats.map(serializeSupportChat),
      openChatId: openChat?.id ?? null,
    });
  } catch (error) {
    console.error("GET /api/support-chats", error);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

export async function POST() {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "customer") {
    return NextResponse.json({ error: "Only customers can create chats" }, { status: 403 });
  }

  try {
    const chat = await createSupportChat(session.userId);
    const full = await listSupportChatsForUser(session.userId, session.role);
    const created = full.find((c) => c.id === chat.id);
    return NextResponse.json({
      chat: created ? serializeSupportChat(created) : { id: chat.id, status: chat.status },
    });
  } catch (error) {
    if (error instanceof SupportChatError && error.code === "OPEN_CHAT_EXISTS") {
      const open = await getOpenSupportChatForUser(session.userId);
      return NextResponse.json(
        { error: "Open chat already exists", openChatId: open?.id },
        { status: 409 },
      );
    }
    console.error("POST /api/support-chats", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
