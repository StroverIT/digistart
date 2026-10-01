import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { META_ADS_PRODUCTS } from "@/config/meta-ads-products";
import { authOptions } from "@/lib/auth";
import {
  getMetaAdsCampaignMap,
  setMetaAdsCampaignMap,
} from "@/lib/server/app-settings";

const patchSchema = z.object({
  campaigns: z.record(z.string(), z.string().trim().min(1).max(200)),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await getMetaAdsCampaignMap();
  return NextResponse.json({ campaigns, products: META_ADS_PRODUCTS });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалидни данни", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const allowed = new Set(META_ADS_PRODUCTS.map((product) => product.id));
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.data.campaigns)) {
      if (!allowed.has(key as (typeof META_ADS_PRODUCTS)[number]["id"])) continue;
      filtered[key] = value;
    }

    const campaigns = await setMetaAdsCampaignMap(filtered);
    return NextResponse.json({ campaigns, products: META_ADS_PRODUCTS });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно записване.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
