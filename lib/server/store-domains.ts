import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isValidStoreDomain,
  normalizeStoreDomain,
  type StoreDomainDto,
  type StoreDomainStatus,
} from "@/lib/store-dns";

export type StoreDomainRow = StoreDomainDto;

type DbRow = {
  id: string;
  order_item_id: string;
  user_id: string;
  service_id: string;
  tenant_project_id: string | null;
  domain: string;
  status: StoreDomainStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: DbRow): StoreDomainRow {
  return {
    id: row.id,
    orderItemId: row.order_item_id,
    userId: row.user_id,
    serviceId: row.service_id,
    tenantProjectId: row.tenant_project_id,
    domain: row.domain,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getStoreDomainByOrderItemId(
  orderItemId: string,
): Promise<StoreDomainRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("store_domains")
    .select("*")
    .eq("order_item_id", orderItemId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as DbRow) : null;
}

export async function listStoreDomains(): Promise<StoreDomainRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("store_domains")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as DbRow));
}

export async function upsertStoreDomainForOrderItem(input: {
  orderItemId: string;
  userId: string;
  serviceId: string;
  domain: string;
  tenantProjectId?: string | null;
}): Promise<StoreDomainRow> {
  const domain = normalizeStoreDomain(input.domain);
  if (!isValidStoreDomain(domain)) {
    throw new Error("INVALID_DOMAIN");
  }

  const supabase = getSupabaseAdmin();
  const payload = {
    order_item_id: input.orderItemId,
    user_id: input.userId,
    service_id: input.serviceId,
    tenant_project_id: input.tenantProjectId ?? null,
    domain,
    status: "pending" as const,
    admin_notes: null,
  };

  const { data, error } = await supabase
    .from("store_domains")
    .upsert(payload, { onConflict: "order_item_id" })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("DOMAIN_TAKEN");
    }
    throw error;
  }

  return mapRow(data as DbRow);
}

export async function updateStoreDomainStatus(
  id: string,
  status: StoreDomainStatus,
  adminNotes?: string | null,
): Promise<StoreDomainRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("store_domains")
    .update({
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as DbRow);
}
