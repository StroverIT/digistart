import type { NewsletterSubscriber } from "@prisma/client";
import { sendNewsletterSignupEmails } from "@/lib/emails/newsletter-emails";
import { prisma } from "@/lib/prisma";

export const COMING_SOON_SOURCE = "coming-soon" as const;
export const COMING_SOON_MAX_SPOTS = 20;

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

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}
