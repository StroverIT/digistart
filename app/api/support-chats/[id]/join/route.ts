import { NextResponse } from "next/server";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import {
  SupportChatError,
  adminJoinSupportChat,
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
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const result = await adminJoinSupportChat(id, session.userId);
    return NextResponse.json({
      chat: serializeSupportChat(result.chat),
      joined: result.joined,
    });
  } catch (error) {
    if (error instanceof SupportChatError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("POST /api/support-chats/[id]/join", error);
    return NextResponse.json({ error: "Failed to join chat" }, { status: 500 });
  }
}
