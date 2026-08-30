import { getSiteUrl } from "@/lib/emails/unsubscribe";

export const THREE_FREE_TIPS_PAGE_PATH = "/google/three-free-tips";

export function buildThreeFreeTipsVideoCtaUrl(params: {
  email: string;
  stage: number;
}): string {
  const url = new URL(`${getSiteUrl()}${THREE_FREE_TIPS_PAGE_PATH}`);
  url.searchParams.set("email", params.email.trim().toLowerCase());
  url.searchParams.set("stage", String(params.stage));
  return url.toString();
}
