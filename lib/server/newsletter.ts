import type { NewsletterSubscriber } from "@prisma/client";
import { sendNewsletterSignupEmails } from "@/lib/emails/newsletter-emails";
import { prisma } from "@/lib/prisma";

export type NewsletterSubscribeResult = {
  subscriber: NewsletterSubscriber;
  alreadySubscribed: boolean;
  emailSent: boolean;
};

export async function subscribeToNewsletter(
  email: string,
  source = "coming-soon",
): Promise<NewsletterSubscribeResult> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    return { subscriber: existing, alreadySubscribed: true, emailSent: false };
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

  return { subscriber, alreadySubscribed: false, emailSent };
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}
