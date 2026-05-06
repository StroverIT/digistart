import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  isMetaCapiConfigured,
  sendMetaCapiEvent,
  type MetaCapiCustomData,
  type MetaCapiEventName,
} from "@/lib/analytics/meta-capi-server";

const eventNameSchema = z.enum(["PageView", "AddToCart", "Purchase", "Lead"]);

const userSchema = z
  .object({
    email: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    externalId: z.string().trim().min(1).optional(),
  })
  .partial()
  .optional();

const contentSchema = z.object({
  id: z.string(),
  quantity: z.number().int().nonnegative(),
  item_price: z.number().nonnegative().optional(),
});

const customDataSchema = z
  .object({
    currency: z.string().optional(),
    value: z.number().nonnegative().optional(),
    content_ids: z.array(z.string()).optional(),
    content_type: z.literal("product").optional(),
    contents: z.array(contentSchema).optional(),
    content_name: z.string().optional(),
    num_items: z.number().int().nonnegative().optional(),
    order_id: z.string().optional(),
  })
  .partial()
  .optional();

const bodySchema = z.object({
  eventName: eventNameSchema,
  eventId: z.string().min(1).max(200),
  eventSourceUrl: z.string().url().optional(),
  user: userSchema,
  customData: customDataSchema,
});

function pickClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? null;
}

export async function POST(req: NextRequest) {
  if (!isMetaCapiConfigured()) {
    return new NextResponse(null, { status: 204 });
  }

  let parsedBody: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    parsedBody = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fbp = req.cookies.get("_fbp")?.value ?? null;
  const fbc = req.cookies.get("_fbc")?.value ?? null;
  const userAgent = req.headers.get("user-agent");
  const clientIp = pickClientIp(req);

  void sendMetaCapiEvent({
    eventName: parsedBody.eventName as MetaCapiEventName,
    eventId: parsedBody.eventId,
    user: parsedBody.user,
    customData: parsedBody.customData as MetaCapiCustomData | undefined,
    context: {
      clientIpAddress: clientIp,
      clientUserAgent: userAgent,
      fbp,
      fbc,
      eventSourceUrl: parsedBody.eventSourceUrl ?? null,
    },
  });

  return new NextResponse(null, { status: 204 });
}
