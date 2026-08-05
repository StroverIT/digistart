import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getThreeFreeTipsCampaignSummary } from "@/lib/server/three-free-tips-campaign";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getThreeFreeTipsCampaignSummary();
  return NextResponse.json(summary);
}
