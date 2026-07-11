export const FUNNEL_SALES_STAGE_STORAGE_KEY = "digistart-funnel-sales-stage-v1";
export const SALES_STAGE_UPDATED_EVENT = "sales-stage-updated";

export const SALES_STAGE_PATHS = ["starting", "selling"] as const;

export type SalesStagePathId = (typeof SALES_STAGE_PATHS)[number];

export const SALES_STAGE_PATH_LABELS: Record<SalesStagePathId, string> = {
  starting: "Искам да продавам",
  selling: "Вече продавам",
};

export type SalesStageAnswer = {
  pathId: SalesStagePathId;
  answeredAt: string;
};

type SalesStageStorageV1 = {
  version: 1;
  answers: Record<string, SalesStageAnswer>;
};

const STORAGE_VERSION = 1 as const;

function isSalesStagePathId(value: unknown): value is SalesStagePathId {
  return typeof value === "string" && SALES_STAGE_PATHS.includes(value as SalesStagePathId);
}

function parseStorage(raw: string): SalesStageStorageV1 | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SalesStageStorageV1>;
    if (parsed.version !== STORAGE_VERSION || typeof parsed.answers !== "object" || !parsed.answers) {
      return null;
    }

    const answers: Record<string, SalesStageAnswer> = {};
    for (const [funnelId, answer] of Object.entries(parsed.answers)) {
      if (!answer || typeof answer !== "object") continue;
      const pathId = (answer as SalesStageAnswer).pathId;
      const answeredAt = (answer as SalesStageAnswer).answeredAt;
      if (!isSalesStagePathId(pathId) || typeof answeredAt !== "string") continue;

      answers[funnelId] = { pathId, answeredAt };
    }

    return { version: STORAGE_VERSION, answers };
  } catch {
    return null;
  }
}

function readStorage(): SalesStageStorageV1 {
  if (typeof window === "undefined") {
    return { version: STORAGE_VERSION, answers: {} };
  }

  const raw = window.localStorage.getItem(FUNNEL_SALES_STAGE_STORAGE_KEY);
  if (!raw) return { version: STORAGE_VERSION, answers: {} };

  return parseStorage(raw) ?? { version: STORAGE_VERSION, answers: {} };
}

function writeStorage(data: SalesStageStorageV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FUNNEL_SALES_STAGE_STORAGE_KEY, JSON.stringify(data));
}

export function getSalesStageAnswer(funnelId: string): SalesStageAnswer | null {
  const storage = readStorage();
  return storage.answers[funnelId] ?? null;
}

export function hasSalesStageAnswer(funnelId: string): boolean {
  return getSalesStageAnswer(funnelId) !== null;
}

export function saveSalesStageAnswer(
  funnelId: string,
  pathId: SalesStagePathId,
): SalesStageAnswer {
  const storage = readStorage();
  const stored: SalesStageAnswer = {
    pathId,
    answeredAt: new Date().toISOString(),
  };
  storage.answers[funnelId] = stored;
  writeStorage(storage);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SALES_STAGE_UPDATED_EVENT, {
        detail: { funnelId },
      }),
    );
  }

  return stored;
}

export function clearSalesStageAnswer(funnelId: string): void {
  if (typeof window === "undefined") return;

  const storage = readStorage();
  if (!storage.answers[funnelId]) return;

  delete storage.answers[funnelId];
  writeStorage(storage);

  window.dispatchEvent(
    new CustomEvent(SALES_STAGE_UPDATED_EVENT, {
      detail: { funnelId },
    }),
  );
}
