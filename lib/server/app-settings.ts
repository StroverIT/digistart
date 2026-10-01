import { prisma } from "@/lib/prisma";
import {
  META_ADS_CAMPAIGN_MAP_SETTING_KEY,
  META_ADS_PRODUCTS,
  getDefaultMetaAdsCampaignMap,
  type MetaAdsCampaignMap,
  type MetaAdsProductId,
} from "@/config/meta-ads-products";

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

export async function getMetaAdsCampaignMap(): Promise<Record<MetaAdsProductId, string>> {
  const defaults = getDefaultMetaAdsCampaignMap();
  const raw = await getAppSetting(META_ADS_CAMPAIGN_MAP_SETTING_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as MetaAdsCampaignMap;
    const next = { ...defaults };
    for (const product of META_ADS_PRODUCTS) {
      const value = parsed[product.id];
      if (typeof value === "string" && value.trim()) {
        next[product.id] = value.trim();
      }
    }
    return next;
  } catch {
    return defaults;
  }
}

export async function setMetaAdsCampaignMap(
  map: MetaAdsCampaignMap,
): Promise<Record<MetaAdsProductId, string>> {
  // Merge into the currently saved map so updating one product never wipes the other.
  const current = await getMetaAdsCampaignMap();
  const next = { ...current };
  for (const product of META_ADS_PRODUCTS) {
    const value = map[product.id];
    if (typeof value === "string" && value.trim()) {
      next[product.id] = value.trim();
    }
  }
  await setAppSetting(META_ADS_CAMPAIGN_MAP_SETTING_KEY, JSON.stringify(next));
  return next;
}
