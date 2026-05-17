/** Service id for subscription online store (see `lib/data/services.ts`). */
export const ONLINE_STORE_SERVICE_ID = "ready-store";

export type StoreDomainStatus = "pending" | "configured" | "misconfigured";

export type StoreDomainDto = {
  id: string;
  orderItemId: string;
  userId: string;
  serviceId: string;
  tenantProjectId: string | null;
  domain: string;
  status: StoreDomainStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export const STORE_DOMAIN_STATUS_LABELS: Record<StoreDomainStatus, string> = {
  pending: "Изчаква проверка",
  configured: "Конфигуриран",
  misconfigured: "Има проблем",
};

const DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/** VPS A-record target shown in DNS setup instructions. */
export function getStoreVpsIp(): string | null {
  return (
    process.env.NEXT_PUBLIC_STORE_VPS_IP?.trim() ||
    process.env.STORE_VPS_IP?.trim() ||
    null
  );
}

export function normalizeStoreDomain(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/\/.*$/, "");
  value = value.replace(/^www\./, "");
  return value;
}

export function isValidStoreDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  return DOMAIN_REGEX.test(domain);
}
