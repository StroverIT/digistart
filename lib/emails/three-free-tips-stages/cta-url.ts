import { getSiteUrl } from "@/lib/emails/unsubscribe";

export const THREE_FREE_TIPS_VIDEO_CTA_PATH = "/services/google-business";
export const THREE_FREE_TIPS_VIDEO_CTA_TYPE = "newsletter";

export function buildThreeFreeTipsVideoCtaUrl(params: {
  email: string;
  stage: number;
}): string {
  const url = new URL(`${getSiteUrl()}${THREE_FREE_TIPS_VIDEO_CTA_PATH}`);
  url.searchParams.set("email", params.email.trim().toLowerCase());
  url.searchParams.set("stage", String(params.stage));
  url.searchParams.set("type", THREE_FREE_TIPS_VIDEO_CTA_TYPE);
  return url.toString();
}
