import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listWaitlistEntriesNewestFirst } from "@/lib/server/service-slots";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await listWaitlistEntriesNewestFirst();
  return NextResponse.json({
    entries: entries.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      serviceId: row.serviceId,
      serviceName: row.service.name,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
