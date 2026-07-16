import type { TargetAudienceLead } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  TARGET_AUDIENCES_SOURCE_DEFAULT,
  type TargetAudienceUrgency,
} from "@/lib/data/target-audiences-content";
import { sendTargetAudienceLeadEmails } from "@/lib/emails/target-audience-emails";

export type TargetAudienceLeadCreateResult =
  | {
      status: "ok";
      lead: TargetAudienceLead;
      alreadyRegistered: boolean;
      emailSent: boolean;
    }
  | { status: "error" };

export async function createTargetAudienceLead(params: {
  name: string;
  email: string;
  phone: string;
  website?: string;
  company: string;
  urgency: TargetAudienceUrgency;
  source?: string;
  pagePath?: string;
}): Promise<TargetAudienceLeadCreateResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const normalizedPhone = params.phone.trim();
  const normalizedName = params.name.trim();
  const normalizedWebsite = params.website?.trim() || undefined;
  const normalizedCompany = params.company.trim();
  const source =
    (params.source?.trim() || TARGET_AUDIENCES_SOURCE_DEFAULT).slice(0, 120);
  const pagePath = params.pagePath?.trim() || undefined;

  const existing = await prisma.targetAudienceLead.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return {
      status: "ok",
      lead: existing,
      alreadyRegistered: true,
      emailSent: false,
    };
  }

  const lead = await prisma.targetAudienceLead.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      website: normalizedWebsite,
      company: normalizedCompany,
      urgency: params.urgency,
      source,
      pagePath,
    },
  });

  let emailSent = false;
  try {
    await sendTargetAudienceLeadEmails({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website ?? undefined,
      company: lead.company,
      urgency: lead.urgency,
      source: lead.source,
      createdAt: lead.createdAt,
    });
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return { status: "ok", lead, alreadyRegistered: false, emailSent };
}

export async function listTargetAudienceLeadsNewestFirst() {
  return prisma.targetAudienceLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}
