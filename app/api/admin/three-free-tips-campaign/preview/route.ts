import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { previewThreeFreeTipsStageEmail } from "@/lib/server/three-free-tips-campaign";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stageParam = searchParams.get("stage");
  const stage = Number.parseInt(stageParam ?? "", 10);

  if (!Number.isFinite(stage) || stage < 1) {
    return NextResponse.json({ error: "Невалиден етап" }, { status: 400 });
  }

  const preview = await previewThreeFreeTipsStageEmail(stage);
  if (!preview) {
    return NextResponse.json({ error: "Няма шаблон за този етап" }, { status: 404 });
  }

  return NextResponse.json(preview);
}
