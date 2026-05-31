import { expect, type Page } from "@playwright/test";
import { VISITOR_PREFERENCES_KEY } from "./storage";
import type {
  MonthlyOrderVolume,
  SalesChannel,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";
import { VISITOR_PREFERENCES_VERSION } from "@/lib/visitor-preferences/types";
import { getServicePath } from "@/lib/visitor-preferences/paths";

export type SurveyCompletionOptions = {
  channels?: SalesChannel[];
  channelLabels?: string[];
  orderVolumeLabel?: string;
  serviceLabels?: string[];
  /** Index in serviceLabels for primary redirect (default 0). */
  primaryServiceIndex?: number;
};

const CHANNEL_LABELS: Record<SalesChannel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  olx: "OLX",
  other: "Друго",
};

const SERVICE_LABELS: Record<VisitorServiceId, string> = {
  "online-store": "Онлайн магазин",
  "ai-automation": "AI Automation",
  ads: "Реклами",
  "social-media": "Социални мрежи",
  "google-business": "Google My Business",
};

const DEFAULT_CHANNELS: SalesChannel[] = ["instagram", "facebook"];
const DEFAULT_ORDER_LABEL = "10-50";
const DEFAULT_SERVICE: VisitorServiceId = "online-store";

export const INVESTMENT_HEADING = "Желаеш ли да инвестираш в бизнеса си?";

function surveyPostBody(request: { postDataJSON: () => unknown }): { kind?: string } | null {
  try {
    return request.postDataJSON() as { kind?: string };
  } catch {
    return null;
  }
}

/** Seed completed visitor preferences before navigation. */
export async function seedCompletedSurveyPreferences(
  page: Page,
  prefs: {
    salesChannels?: SalesChannel[];
    monthlyOrders?: MonthlyOrderVolume;
    selectedServices?: VisitorServiceId[];
    primaryService?: VisitorServiceId;
  } = {},
) {
  const salesChannels = prefs.salesChannels ?? DEFAULT_CHANNELS;
  const monthlyOrders = prefs.monthlyOrders ?? "10-50";
  const selectedServices = prefs.selectedServices ?? [DEFAULT_SERVICE];
  const primaryService = prefs.primaryService ?? selectedServices[0];

  await page.addInitScript(
    ({ key, payload }) => {
      localStorage.setItem(key, JSON.stringify(payload));
    },
    {
      key: VISITOR_PREFERENCES_KEY,
      payload: {
        version: VISITOR_PREFERENCES_VERSION,
        salesChannels,
        monthlyOrders,
        selectedServices,
        primaryService,
        completedAt: new Date().toISOString(),
      },
    },
  );
}

export async function expectSavedSurveyPreferences(
  page: Page,
  expected: { primaryService: VisitorServiceId },
) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), VISITOR_PREFERENCES_KEY);
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw!) as { primaryService: VisitorServiceId };
  expect(parsed.primaryService).toBe(expected.primaryService);
}

export async function waitForSurveyAnalytics(
  page: Page,
  kind: "answer" | "completion",
  timeout = 30_000,
) {
  const response = await page.waitForResponse(
    (res) => {
      if (!res.url().includes("/api/analytics/survey") || res.request().method() !== "POST") {
        return false;
      }
      const body = surveyPostBody(res.request());
      return body?.kind === kind;
    },
    { timeout },
  );
  expect(response.ok()).toBeTruthy();
  return surveyPostBody(response.request());
}

export async function answerInvestmentQuestion(page: Page, answer: "yes" | "no" = "yes") {
  await expect(page.getByRole("heading", { name: INVESTMENT_HEADING })).toBeVisible({
    timeout: 30_000,
  });

  const label = answer === "yes" ? "Да" : "Не";
  await page.getByRole("button", { name: label, exact: true }).click();
}

/** Walk through the homepage visitor survey and finish on the primary service page. */
export async function completeVisitorSurvey(
  page: Page,
  options: SurveyCompletionOptions = {},
) {
  const channels = options.channels ?? DEFAULT_CHANNELS;
  const channelLabels =
    options.channelLabels ?? channels.map((c) => CHANNEL_LABELS[c]);
  const orderVolumeLabel = options.orderVolumeLabel ?? DEFAULT_ORDER_LABEL;
  const serviceLabels = options.serviceLabels ?? [SERVICE_LABELS[DEFAULT_SERVICE]];
  const primaryIndex = options.primaryServiceIndex ?? 0;
  const primaryLabel = serviceLabels[primaryIndex] ?? serviceLabels[0];

  const serviceId = (Object.entries(SERVICE_LABELS).find(
    ([, label]) => label === primaryLabel,
  )?.[0] ?? DEFAULT_SERVICE) as VisitorServiceId;

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await answerInvestmentQuestion(page, "yes");
  await expect(
    page.getByRole("heading", { name: "Къде продаваш в момента?" }),
  ).toBeVisible({ timeout: 30_000 });

  for (const label of channelLabels) {
    await page.getByRole("button", { name: label, exact: true }).click();
  }

  await page.getByRole("button", { name: "Продължи" }).click();
  await expect(
    page.getByRole("heading", { name: "Грубо колко поръчки правиш на месец?" }),
  ).toBeVisible();

  const completionPromise = waitForSurveyAnalytics(page, "completion");

  await page.getByRole("button", { name: orderVolumeLabel, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "От кои услуги се интересуваш?" }),
  ).toBeVisible();

  for (const label of serviceLabels) {
    await page.getByRole("button", { name: label }).click();
  }

  await page.getByRole("button", { name: "Продължи" }).click();

  await completionPromise;
  await page.waitForURL(`**${getServicePath(serviceId)}**`, { timeout: 30_000 });
  await expectSavedSurveyPreferences(page, { primaryService: serviceId });

  return { primaryService: serviceId };
}

export async function openVisitorSurveyFromHome(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: INVESTMENT_HEADING })).toBeVisible({
    timeout: 30_000,
  });
}
