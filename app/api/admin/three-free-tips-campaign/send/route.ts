import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDailyThreeFreeTipsStageEmails } from "@/lib/server/three-free-tips-campaign";

export const maxDuration = 60;

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
