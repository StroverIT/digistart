import { test, expect } from "./fixtures";
import {
  completeVisitorSurvey,
  openVisitorSurveyFromHome,
  seedCompletedSurveyPreferences,
  waitForSurveyAnalytics,
} from "./helpers/survey";
import { getServicePath } from "@/lib/visitor-preferences/paths";
import { openMainMenu } from "./helpers/navigation";

test.describe("Visitor survey", () => {
  test("first visit completes survey, saves preferences, and redirects", async ({ page }) => {
    const answerPromise = waitForSurveyAnalytics(page, "answer");

    await openVisitorSurveyFromHome(page);
    await page.getByRole("button", { name: "Instagram", exact: true }).click();
    const answerBody = await answerPromise;
    expect(answerBody).toMatchObject({
      kind: "answer",
      question: "sales_channels",
      answer: "instagram",
    });

    await page.getByRole("button", { name: "Facebook", exact: true }).click();
    await page.getByRole("button", { name: "Продължи" }).click();
    await expect(
      page.getByRole("heading", { name: "Грубо колко поръчки правиш на месец?" }),
    ).toBeVisible();

    const completionPromise = waitForSurveyAnalytics(page, "completion");
    await page.getByRole("button", { name: "10-50", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "От кои услуги се интересуваш?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Онлайн магазин" }).click();
    await page.getByRole("button", { name: "Продължи" }).click();
    await completionPromise;

    await page.waitForURL(`**${getServicePath("online-store")}**`, { timeout: 30_000 });
  });

  test("return visit auto-redirects to primary service", async ({ page }) => {
    await seedCompletedSurveyPreferences(page, { primaryService: "ads" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(`**${getServicePath("ads")}**`, { timeout: 30_000 });
    await expect(page).not.toHaveURL(/\?/);
  });

  test("edit mode shows survey with saved answers context", async ({ page }) => {
    await seedCompletedSurveyPreferences(page);
    await page.goto("/?edit=1", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Къде продаваш в момента?" }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("reset survey from menu returns to homepage survey", async ({ page }) => {
    await seedCompletedSurveyPreferences(page, { primaryService: "online-store" });
    await page.goto(getServicePath("online-store"), { waitUntil: "domcontentloaded" });

    await openMainMenu(page);
    await page.getByRole("button", { name: "Промени мнението си" }).click();

    await page.waitForURL("**/", { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Къде продаваш в момента?" }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
