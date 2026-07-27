import { prisma } from "@/lib/prisma";

export const THREE_FREE_TIPS_VIDEO_URL_KEY = "three_free_tips_video_url" as const;

/** Fallback when no admin override is saved. */
export const THREE_FREE_TIPS_VIDEO_URL_DEFAULT =
  "https://youtu.be/_yCuk-GYlzo" as const;

export async function getAppSetting(key: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<string> {
  const row = await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return row.value;
}

export async function getThreeFreeTipsVideoUrl(): Promise<string> {
  const value = await getAppSetting(THREE_FREE_TIPS_VIDEO_URL_KEY);
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : THREE_FREE_TIPS_VIDEO_URL_DEFAULT;
}

export async function setThreeFreeTipsVideoUrl(url: string): Promise<string> {
  return setAppSetting(THREE_FREE_TIPS_VIDEO_URL_KEY, url.trim());
}
