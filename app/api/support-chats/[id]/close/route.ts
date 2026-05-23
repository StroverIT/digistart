import { NextResponse } from "next/server";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import {
  SupportChatError,
  closeSupportChat,
  getSupportChatById,
  serializeSupportChat,
} from "@/lib/server/support-chats";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const chat = await closeSupportChat(id, session.userId, session.role);
    const full = await getSupportChatById(chat.id, session.userId, session.role);
    return NextResponse.json({ chat: serializeSupportChat(full) });
  } catch (error) {
    if (error instanceof SupportChatError) {
      if (error.code === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (error.code === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("POST /api/support-chats/[id]/close", error);
    return NextResponse.json({ error: "Failed to close chat" }, { status: 500 });
  }
}
