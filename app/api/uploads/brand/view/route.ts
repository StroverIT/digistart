import { NextResponse } from "next/server";
import { BRAND_ASSETS_BUCKET, getSupabaseAdmin } from "@/lib/supabase/admin";

function extractStoragePath(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const marker = `/${BRAND_ASSETS_BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    const path = u.pathname.slice(idx + marker.length);
    return path || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url param." }, { status: 400 });
  }

  const path = extractStoragePath(rawUrl);
  if (!path) {
    return NextResponse.json({ error: "Invalid storage URL." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BRAND_ASSETS_BUCKET).download(path);
  if (error || !data) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
