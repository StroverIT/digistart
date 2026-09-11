import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { previewEmailCatalogEntry } from "@/lib/server/email-catalog-previews";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Липсва id на шаблона" }, { status: 400 });
  }

  const preview = await previewEmailCatalogEntry(id);
  if (!preview) {
    return NextResponse.json({ error: "Неизвестен имейл шаблон" }, { status: 404 });
  }

  return NextResponse.json(preview);
}
