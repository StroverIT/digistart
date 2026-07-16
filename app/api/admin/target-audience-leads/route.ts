import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listTargetAudienceLeadsNewestFirst } from "@/lib/server/target-audience-leads";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await listTargetAudienceLeadsNewestFirst();
  return NextResponse.json({
    leads: leads.map((row: (typeof leads)[number]) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      website: row.website,
      company: row.company,
      urgency: row.urgency,
      source: row.source,
      pagePath: row.pagePath,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
