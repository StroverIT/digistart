import type { NewsletterSubscriber, Prisma } from "@prisma/client";
import { sendNewsletterSignupEmails } from "@/lib/emails/newsletter-emails";
import { prisma } from "@/lib/prisma";

export const COMING_SOON_SOURCE = "coming-soon" as const;
export const COMING_SOON_MAX_SPOTS = 20;
export const TEMPLATE_NICHE_SOURCE = "template-niche-recommendation" as const;
export const NICHE_LAUNCH_DISCOUNT_PERCENT = 10;

export type NicheRecommendationEntry = {
  type: "niche_recommendation";
  requestedNiche: string;
  discountPercent: typeof NICHE_LAUNCH_DISCOUNT_PERCENT;
  discountFor: "niche_launch";
  requestedAt: string;
};

export type NicheRecommendationMetadata = {
  nicheRecommendations: NicheRecommendationEntry[];
};

export type NicheRecommendationSubscribeResult =
  | {
      status: "ok";
      subscriber: NewsletterSubscriber;
      alreadySubscribed: boolean;
    }
  | { status: "invalid_niche" };

export type NewsletterSubscribeResult =
  | {
      status: "ok";
      subscriber: NewsletterSubscriber;
      alreadySubscribed: boolean;
      emailSent: boolean;
    }
  | { status: "full" };

export async function countNewsletterSubscribersBySource(source: string): Promise<number> {
  return prisma.newsletterSubscriber.count({ where: { source } });
}

export async function getComingSoonSpotsRemaining(): Promise<number> {
  const count = await countNewsletterSubscribersBySource(COMING_SOON_SOURCE);
  return Math.max(0, COMING_SOON_MAX_SPOTS - count);
}

export async function subscribeToNewsletter(
  email: string,
  source = COMING_SOON_SOURCE,
): Promise<NewsletterSubscribeResult> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    return {
      status: "ok",
      subscriber: existing,
      alreadySubscribed: true,
      emailSent: false,
    };
  }

  if (source === COMING_SOON_SOURCE) {
    const n = await countNewsletterSubscribersBySource(source);
    if (n >= COMING_SOON_MAX_SPOTS) {
      return { status: "full" };
    }
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email: normalized, source },
  });

  let emailSent = false;
  try {
    await sendNewsletterSignupEmails({
      email: normalized,
      source,
      subscribedAt: subscriber.createdAt,
    });
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return {
    status: "ok",
    subscriber,
    alreadySubscribed: false,
    emailSent,
  };
}

function normalizeNiche(niche: string): string {
  return niche.trim().replace(/\s+/g, " ");
}

function buildNicheRecommendationEntry(niche: string): NicheRecommendationEntry {
  return {
    type: "niche_recommendation",
    requestedNiche: niche,
    discountPercent: NICHE_LAUNCH_DISCOUNT_PERCENT,
    discountFor: "niche_launch",
    requestedAt: new Date().toISOString(),
  };
}

function mergeNicheRecommendationMetadata(
  existing: Prisma.JsonValue | null | undefined,
  niche: string,
): NicheRecommendationMetadata {
  const entry = buildNicheRecommendationEntry(niche);
  const normalizedNiche = entry.requestedNiche.toLowerCase();

  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return { nicheRecommendations: [entry] };
  }

  const meta = existing as Record<string, unknown>;
  const existingList = Array.isArray(meta.nicheRecommendations)
    ? (meta.nicheRecommendations as NicheRecommendationEntry[])
    : meta.type === "niche_recommendation"
      ? [meta as unknown as NicheRecommendationEntry]
      : [];

  const hasNiche = existingList.some(
    (item) => item.requestedNiche?.toLowerCase() === normalizedNiche,
  );

  return {
    nicheRecommendations: hasNiche ? existingList : [...existingList, entry],
  };
}

export async function subscribeToNicheRecommendation(
  email: string,
  niche: string,
): Promise<NicheRecommendationSubscribeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedNiche = normalizeNiche(niche);

  if (normalizedNiche.length < 2) {
    return { status: "invalid_niche" };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalizedEmail },
  });

  const metadata = mergeNicheRecommendationMetadata(existing?.metadata, normalizedNiche);

  if (existing) {
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { metadata },
    });

    return {
      status: "ok",
      subscriber,
      alreadySubscribed: true,
    };
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email: normalizedEmail,
      source: TEMPLATE_NICHE_SOURCE,
      metadata,
    },
  });

  return {
    status: "ok",
    subscriber,
    alreadySubscribed: false,
  };
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}
