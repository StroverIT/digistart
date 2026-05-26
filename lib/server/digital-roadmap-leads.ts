import type { DigitalRoadmapLead } from "@prisma/client";
import { sendDigitalRoadmapLeadEmails } from "@/lib/emails/digital-roadmap-emails";
import { prisma } from "@/lib/prisma";

export const DEFAULT_DIGITAL_ROADMAP_SOURCE = "digital-roadmap" as const;

export type DigitalRoadmapLeadCreateResult =
  | {
      status: "ok";
      lead: DigitalRoadmapLead;
      alreadyRegistered: boolean;
      emailSent: boolean;
    }
  | { status: "error" };

export async function createDigitalRoadmapLead(params: {
  name: string;
  email: string;
  source?: string;
}): Promise<DigitalRoadmapLeadCreateResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const normalizedName = params.name.trim();
  const source = (params.source?.trim() || DEFAULT_DIGITAL_ROADMAP_SOURCE).slice(0, 120);

  const existing = await prisma.digitalRoadmapLead.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return {
      status: "ok",
      lead: existing,
      alreadyRegistered: true,
      emailSent: false,
    };
  }

  const lead = await prisma.digitalRoadmapLead.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      source,
    },
  });

  let emailSent = false;
  try {
    await sendDigitalRoadmapLeadEmails({
      name: lead.name,
      email: lead.email,
      source: lead.source,
      createdAt: lead.createdAt,
    });
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return {
    status: "ok",
    lead,
    alreadyRegistered: false,
    emailSent,
  };
}

export async function listDigitalRoadmapLeadsNewestFirst() {
  return prisma.digitalRoadmapLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}
