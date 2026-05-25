import { test, expect } from "./fixtures";
import { completeVisitorSurvey } from "./helpers/survey";
import { signInAsAdmin, expectAdminDashboardLoaded } from "./helpers/admin";

test.describe.configure({ mode: "serial", timeout: 240_000 });

test.describe("Survey analytics on admin dashboard", () => {
  test("completed survey appears in admin questionnaire section", async ({ page }) => {
    await completeVisitorSurvey(page, {
      channels: ["instagram", "olx"],
      channelLabels: ["Instagram", "OLX"],
      orderVolumeLabel: "50–100",
      serviceLabels: ["Реклами", "Социални мрежи"],
      primaryServiceIndex: 0,
    });

    await signInAsAdmin(page);
    await expectAdminDashboardLoaded(page);

    const surveyCard = page
      .locator("[data-admin-animate]")
      .filter({ has: page.getByText("Въпросник посетители") });

    await expect(surveyCard.getByText("Комбинации (легенда)")).toBeVisible({
      timeout: 60_000,
    });
    await expect(surveyCard.getByText(/=.*пъти/)).toBeVisible({ timeout: 60_000 });
  });
});
