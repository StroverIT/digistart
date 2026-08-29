import type { GoogleAnalysis3TipsLead } from "@prisma/client";
import {
  GOOGLE_ANALYSIS_3_TIPS_SOURCE,
  type GoogleFreeAnalysisLeadStatus,
  type GoogleFreeAnalysisUrgency,
} from "@/lib/data/google-free-analysis-content";
import { sendGoogleAnalysis3TipsLeadEmails } from "@/lib/emails/google-analysis-3-tips-emails";
import { prisma } from "@/lib/prisma";

export type GoogleAnalysis3TipsLeadCreateResult =
  | {
      status: "ok";
      lead: GoogleAnalysis3TipsLead;
      alreadyRegistered: boolean;
      emailSent: boolean;
    }
  | { status: "error" };

export async function createGoogleAnalysis3TipsLead(params: {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  googleMapsUrl: string;
  urgency: GoogleFreeAnalysisUrgency;
  source?: string;
  pagePath?: string;
}): Promise<GoogleAnalysis3TipsLeadCreateResult> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const normalizedName = params.name.trim();
  const normalizedPhone = params.phone.trim();
  const normalizedWebsite = params.website.trim();
  const normalizedCompany = params.company.trim();
  const normalizedMapsUrl = params.googleMapsUrl.trim();
  const source =
    (params.source?.trim() || GOOGLE_ANALYSIS_3_TIPS_SOURCE).slice(0, 120);
  const pagePath = params.pagePath?.trim() || undefined;

  const existing = await prisma.googleAnalysis3TipsLead.findFirst({
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

  const lead = await prisma.googleAnalysis3TipsLead.create({
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
    await sendGoogleAnalysis3TipsLeadEmails({
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

export async function listGoogleAnalysis3TipsLeadsNewestFirst() {
  return prisma.googleAnalysis3TipsLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGoogleAnalysis3TipsLeadStatus(
  id: string,
  status: GoogleFreeAnalysisLeadStatus,
) {
  return prisma.googleAnalysis3TipsLead.update({
    where: { id },
    data: { status },
  });
}

export async function updateGoogleAnalysis3TipsLeadNotes(
  id: string,
  notes: string | null,
) {
  return prisma.googleAnalysis3TipsLead.update({
    where: { id },
    data: { notes },
  });
}
