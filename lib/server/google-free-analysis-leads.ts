import type { GoogleFreeAnalysisLead } from "@prisma/client";
import {
  GOOGLE_FREE_ANALYSIS_SOURCE_DEFAULT,
  type GoogleFreeAnalysisUrgency,
} from "@/lib/data/google-free-analysis-content";
import { sendGoogleFreeAnalysisLeadEmails } from "@/lib/emails/google-free-analysis-emails";
import { prisma } from "@/lib/prisma";

export type GoogleFreeAnalysisLeadCreateResult =
  | {
      status: "ok";
      lead: GoogleFreeAnalysisLead;
      alreadyRegistered: boolean;
      emailSent: boolean;
    }
  | { status: "error" };

export async function createGoogleFreeAnalysisLead(params: {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  googleMapsUrl: string;
  urgency: GoogleFreeAnalysisUrgency;
  source?: string;
  pagePath?: string;
}): Promise<GoogleFreeAnalysisLeadCreateResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const normalizedName = params.name.trim();
  const normalizedPhone = params.phone.trim();
  const normalizedWebsite = params.website.trim();
  const normalizedCompany = params.company.trim();
  const normalizedMapsUrl = params.googleMapsUrl.trim();
  const source =
    (params.source?.trim() || GOOGLE_FREE_ANALYSIS_SOURCE_DEFAULT).slice(0, 120);
  const pagePath = params.pagePath?.trim() || undefined;

  const existing = await prisma.googleFreeAnalysisLead.findFirst({
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

  const lead = await prisma.googleFreeAnalysisLead.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      website: normalizedWebsite,
      company: normalizedCompany,
      googleMapsUrl: normalizedMapsUrl,
      urgency: params.urgency,
      source,
      pagePath,
    },
  });

  let emailSent = false;
  try {
    await sendGoogleFreeAnalysisLeadEmails({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      company: lead.company,
      googleMapsUrl: lead.googleMapsUrl,
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

export async function listGoogleFreeAnalysisLeadsNewestFirst() {
  return prisma.googleFreeAnalysisLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}
