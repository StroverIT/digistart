import { NextResponse } from "next/server";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import {
  SupportChatError,
  getSupportChatById,
  serializeSupportChat,
} from "@/lib/server/support-chats";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const chat = await getSupportChatById(id, session.userId, session.role);
    return NextResponse.json({ chat: serializeSupportChat(chat) });
  } catch (error) {
    if (error instanceof SupportChatError) {
      if (error.code === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (error.code === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("GET /api/support-chats/[id]", error);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}
