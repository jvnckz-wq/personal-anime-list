import { expect, test } from "@playwright/test";
import { sampleList } from "./support/catalog";
import { mockApis, seedList } from "./support/mock-api";

const ROUTES = ["/", "/discover", "/list", "/anime/1", "/stats"];

for (const width of [360, 390, 768, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("every screen fits without sideways scroll", async ({ page }) => {
      await mockApis(page);
      await seedList(page, sampleList());
      for (const route of ROUTES) {
        await page.goto(route);
        await page.locator("main h1:visible").waitFor();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
      }
    });
  });
}

test.describe("phone", () => {
  test.use({ viewport: { width: 360, height: 780 }, hasTouch: true });

  test("bottom menu fits and filters sit behind a toggle", async ({ page }) => {
    await mockApis(page);
    await page.goto("/discover");
    const menu = page.locator(".menu");
    expect(await menu.evaluate((m) => m.scrollWidth - m.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.locator(".filters--main")).toBeHidden();
    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.locator(".filters--main .chip").first()).toBeVisible();
  });
});
