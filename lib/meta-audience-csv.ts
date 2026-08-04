/**
 * Meta Ads customer list CSV format (identifiers only).
 * @see https://www.facebook.com/business/help/2082575038703844
 */
export const META_AUDIENCE_HEADER = "email,phone,fn,ln,zip,country" as const;

export type MetaAudienceRow = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  zip?: string | null;
  country?: string | null;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Digits only, with BG country code when the number looks local. */
export function normalizeMetaAudiencePhone(phone: string | null | undefined): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";

  let digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("359")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `359${digits.slice(1)}`;
  }

  // Local mobile without leading 0 (e.g. 888123456)
  if (digits.length === 9 && /^[87]/.test(digits)) {
    return `359${digits}`;
  }

  return digits;
}

export function splitPersonName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!.toLowerCase(), lastName: "" };
  return {
    firstName: parts[0]!.toLowerCase(),
    lastName: parts.slice(1).join(" ").toLowerCase(),
  };
}

export function buildMetaAudienceCsv(rows: MetaAudienceRow[]): string {
  const lines = [META_AUDIENCE_HEADER];

  for (const row of rows) {
    const cells = [
      normalizeEmail(row.email),
      normalizeMetaAudiencePhone(row.phone),
      (row.firstName ?? "").trim().toLowerCase(),
      (row.lastName ?? "").trim().toLowerCase(),
      (row.zip ?? "").trim(),
      (row.country ?? "bg").trim().toLowerCase(),
    ].map(escapeCsvCell);

    lines.push(cells.join(","));
  }

  return `${lines.join("\n")}\n`;
}

export function downloadTextFile(
  filename: string,
  contents: string,
  mime = "text/csv;charset=utf-8",
) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
