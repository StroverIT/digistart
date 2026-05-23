import { NextResponse } from "next/server";
import { requireSupportChatSession } from "@/lib/server/support-chat-auth";
import { createSupabaseRealtimeToken } from "@/lib/supabase/realtime-auth";

export async function GET() {
  const session = await requireSupportChatSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appRole = session.role === "admin" ? "admin" : "customer";
    const token = await createSupabaseRealtimeToken({
      userId: session.userId,
      role: appRole,
    });
    return NextResponse.json(token);
  } catch (error) {
    console.error("GET /api/support-chats/realtime-token", error);
    if (error instanceof Error && error.message.includes("SUPABASE_JWT_SECRET")) {
      return NextResponse.json({ error: "Realtime not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to issue realtime token" }, { status: 500 });
  }
}
