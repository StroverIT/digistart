import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDigitalRoadmapLeadsNewestFirst } from "@/lib/server/digital-roadmap-leads";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await listDigitalRoadmapLeadsNewestFirst();
  return NextResponse.json({
    leads: leads.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      source: row.source,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
