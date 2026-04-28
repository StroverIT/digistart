import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BRAND_ASSETS_BUCKET, getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const logo = form.get("logo");
    const palette = form.get("palette");

    if (!(logo instanceof File) && !(palette instanceof File)) {
      return NextResponse.json({ error: "Изберете поне един файл." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const base = randomUUID();
    const out: { logoUrl?: string; paletteUrl?: string } = {};

    async function uploadField(file: File, suffix: string) {
      if (file.size > MAX_BYTES) {
        throw new Error("FILE_TOO_LARGE");
      }
      const type = file.type || "application/octet-stream";
      if (!ALLOWED.has(type)) {
        throw new Error("BAD_TYPE");
      }
      const ext =
        type === "image/png"
          ? "png"
          : type === "image/jpeg"
            ? "jpg"
            : type === "image/webp"
              ? "webp"
              : type === "image/svg+xml"
                ? "svg"
                : "pdf";
      const path = `uploads/${base}-${suffix}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage.from(BRAND_ASSETS_BUCKET).upload(path, buffer, {
        contentType: type,
        upsert: false,
      });
      if (error) {
        console.error("Supabase upload", error);
        throw new Error("UPLOAD_FAILED");
      }
      const { data: pub } = supabase.storage.from(BRAND_ASSETS_BUCKET).getPublicUrl(data.path);
      return pub.publicUrl;
    }

    if (logo instanceof File && logo.size > 0) {
      out.logoUrl = await uploadField(logo, "logo");
    }
    if (palette instanceof File && palette.size > 0) {
      out.paletteUrl = await uploadField(palette, "palette");
    }

    return NextResponse.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Файлът е твърде голям (макс. 8 MB)." }, { status: 400 });
    }
    if (msg === "BAD_TYPE") {
      return NextResponse.json({ error: "Непозволен тип файл." }, { status: 400 });
    }
    if (e instanceof Error && e.message.includes("Missing")) {
      return NextResponse.json({ error: "Качването не е конфигурирано." }, { status: 503 });
    }
    return NextResponse.json({ error: "Качването не бе успешно." }, { status: 500 });
  }
}
