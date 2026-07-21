import type { NewsletterSubscriber, Prisma } from "@prisma/client";
import {
  sendGoogleNewsletterEmails,
  sendNewsletterSignupEmails,
  sendNicheRecommendationEmails,
  sendThreeFreeTipsEmails,
} from "@/lib/emails/newsletter-emails";
import { prisma } from "@/lib/prisma";

export const COMING_SOON_SOURCE = "coming-soon" as const;
export const COMING_SOON_MAX_SPOTS = 20;
export const TEMPLATE_NICHE_SOURCE = "template-niche-recommendation" as const;
export const THREE_FREE_TIPS_SOURCE = "three-free-tips" as const;
export const GOOGLE_NEWSLETTER_SOURCE = "google-newsletter" as const;
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
      emailSent: boolean;
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
): { metadata: NicheRecommendationMetadata; isNewNiche: boolean } {
  const entry = buildNicheRecommendationEntry(niche);
  const normalizedNiche = entry.requestedNiche.toLowerCase();

  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return { metadata: { nicheRecommendations: [entry] }, isNewNiche: true };
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
    metadata: {
      nicheRecommendations: hasNiche ? existingList : [...existingList, entry],
    },
    isNewNiche: !hasNiche,
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

  const { metadata, isNewNiche } = mergeNicheRecommendationMetadata(
    existing?.metadata,
    normalizedNiche,
  );

  let subscriber: NewsletterSubscriber;

  if (existing) {
    subscriber = await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { metadata },
    });
  } else {
    subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        source: TEMPLATE_NICHE_SOURCE,
        metadata,
      },
    });
  }

  let emailSent = false;
  if (isNewNiche) {
    try {
      await sendNicheRecommendationEmails({
        email: normalizedEmail,
        niche: normalizedNiche,
        submittedAt: new Date(),
        isNewSubscriber: !existing,
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }

  return {
    status: "ok",
    subscriber,
    alreadySubscribed: Boolean(existing),
    emailSent,
  };
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function listThreeFreeTipsSubscribersNewestFirst() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return subscribers.filter((row) => {
    if (row.source === THREE_FREE_TIPS_SOURCE) return true;
    if (!row.metadata || typeof row.metadata !== "object" || Array.isArray(row.metadata)) {
      return false;
    }
    return "threeFreeTipsAt" in row.metadata;
  });
}

export type ThreeFreeTipsSubscribeResult = {
  status: "ok";
  subscriber: NewsletterSubscriber;
  alreadySubscribed: boolean;
  emailSent: boolean;
};

export async function subscribeToThreeFreeTips(
  email: string,
): Promise<ThreeFreeTipsSubscribeResult> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  const tipMeta = { threeFreeTipsAt: new Date().toISOString() };
  const mergedMetadata =
    existing?.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? { ...(existing.metadata as Record<string, unknown>), ...tipMeta }
      : tipMeta;

  const alreadyHadTips =
    Boolean(existing) &&
    (existing!.source === THREE_FREE_TIPS_SOURCE ||
      (existing!.metadata &&
        typeof existing!.metadata === "object" &&
        !Array.isArray(existing!.metadata) &&
        "threeFreeTipsAt" in existing!.metadata));

  const subscriber = existing
    ? await prisma.newsletterSubscriber.update({
        where: { email: normalized },
        data: { metadata: mergedMetadata },
      })
    : await prisma.newsletterSubscriber.create({
        data: {
          email: normalized,
          source: THREE_FREE_TIPS_SOURCE,
          metadata: tipMeta,
        },
      });

  let emailSent = false;

  try {
    await sendThreeFreeTipsEmails({
      email: normalized,
      source: THREE_FREE_TIPS_SOURCE,
      subscribedAt: subscriber.createdAt,
      notifyAdmin: !alreadyHadTips,
    });
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return {
    status: "ok",
    subscriber,
    alreadySubscribed: Boolean(existing),
    emailSent,
  };
}

export type GoogleNewsletterSubscribeResult = {
  status: "ok";
  subscriber: NewsletterSubscriber;
  alreadySubscribed: boolean;
  emailSent: boolean;
};

export async function subscribeToGoogleNewsletter(
  email: string,
  firstName: string,
): Promise<GoogleNewsletterSubscribeResult> {
  const normalized = email.trim().toLowerCase();
  const normalizedName = firstName.trim().replace(/\s+/g, " ");
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  const signupMeta = {
    firstName: normalizedName,
    googleNewsletterAt: new Date().toISOString(),
  };
  const mergedMetadata =
    existing?.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? { ...(existing.metadata as Record<string, unknown>), ...signupMeta }
      : signupMeta;

  const alreadyHadGoogleNewsletter =
    Boolean(existing) &&
    (existing!.source === GOOGLE_NEWSLETTER_SOURCE ||
      (existing!.metadata &&
        typeof existing!.metadata === "object" &&
        !Array.isArray(existing!.metadata) &&
        "googleNewsletterAt" in existing!.metadata));

  const subscriber = existing
    ? await prisma.newsletterSubscriber.update({
        where: { email: normalized },
        data: { metadata: mergedMetadata },
      })
    : await prisma.newsletterSubscriber.create({
        data: {
          email: normalized,
          source: GOOGLE_NEWSLETTER_SOURCE,
          metadata: signupMeta,
        },
      });

  let emailSent = false;

  try {
    await sendGoogleNewsletterEmails({
      email: normalized,
      firstName: normalizedName,
      source: GOOGLE_NEWSLETTER_SOURCE,
      subscribedAt: subscriber.createdAt,
      notifyAdmin: !alreadyHadGoogleNewsletter,
    });
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return {
    status: "ok",
    subscriber,
    alreadySubscribed: Boolean(existing),
    emailSent,
  };
}
