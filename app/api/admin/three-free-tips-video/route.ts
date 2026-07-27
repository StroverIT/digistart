import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getThreeFreeTipsVideoUrl,
  setThreeFreeTipsVideoUrl,
  THREE_FREE_TIPS_VIDEO_URL_DEFAULT,
} from "@/lib/server/app-settings";

const patchSchema = z.object({
  videoUrl: z
    .string()
    .trim()
    .url("Невалиден URL")
    .max(2000),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoUrl = await getThreeFreeTipsVideoUrl();
  return NextResponse.json({
    videoUrl,
    defaultVideoUrl: THREE_FREE_TIPS_VIDEO_URL_DEFAULT,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалиден URL", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const videoUrl = await setThreeFreeTipsVideoUrl(parsed.data.videoUrl);
    return NextResponse.json({
      videoUrl,
      defaultVideoUrl: THREE_FREE_TIPS_VIDEO_URL_DEFAULT,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно записване на линка.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
