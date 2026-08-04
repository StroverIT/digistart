/**
 * Meta Ads value-based customer list CSV format.
 * @see https://www.facebook.com/business/help/2082575038703844
 */
export const META_VALUE_BASED_AUDIENCE_HEADER =
  "email,email,email,phone,phone,phone,madid,fn,ln,zip,ct,st,country,dob,doby,gen,age,uid,value" as const;

export type MetaValueBasedAudienceRow = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  uid?: string | null;
  value: number;
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

function formatValue(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "1";
  // Meta accepts decimals; avoid locale commas.
  return String(Math.round(value * 100) / 100);
}

export function buildMetaValueBasedAudienceCsv(
  rows: MetaValueBasedAudienceRow[],
): string {
  const lines = [META_VALUE_BASED_AUDIENCE_HEADER];

  for (const row of rows) {
    const email = normalizeEmail(row.email);
    const phone = normalizeMetaAudiencePhone(row.phone);
    const fn = (row.firstName ?? "").trim().toLowerCase();
    const ln = (row.lastName ?? "").trim().toLowerCase();
    const country = (row.country ?? "bg").trim().toLowerCase();
    const uid = (row.uid ?? "").trim();
    const value = formatValue(row.value);

    const cells = [
      email,
      "",
      "",
      phone,
      "",
      "",
      "",
      fn,
      ln,
      "",
      "",
      "",
      country,
      "",
      "",
      "",
      "",
      uid,
      value,
    ].map(escapeCsvCell);

    lines.push(cells.join(","));
  }

  return `${lines.join("\n")}\n`;
}

export function downloadTextFile(filename: string, contents: string, mime = "text/csv;charset=utf-8") {
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

/** Relative lead values for Meta value-based lookalikes (higher = warmer). */
export const META_AUDIENCE_LEAD_VALUES = {
  threeFreeTips: 1,
  freeAnalysisByUrgency: {
    today: 10,
    tomorrow: 7,
    few_weeks: 4,
  },
  freeAnalysisDefault: 5,
} as const;

export function freeAnalysisAudienceValue(urgency: string): number {
  const map = META_AUDIENCE_LEAD_VALUES.freeAnalysisByUrgency;
  if (urgency in map) {
    return map[urgency as keyof typeof map];
  }
  return META_AUDIENCE_LEAD_VALUES.freeAnalysisDefault;
}
