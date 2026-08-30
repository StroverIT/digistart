import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDailyThreeFreeTipsStageEmails } from "@/lib/server/three-free-tips-campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Must stay a literal. Keep in sync with `functionMaxDurationSeconds` in config/tips-campaign-send.ts */
export const maxDuration = 10;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDailyThreeFreeTipsStageEmails();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно изпращане на имейлите.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
