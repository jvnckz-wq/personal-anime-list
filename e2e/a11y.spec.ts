import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { sampleList } from "./support/catalog";
import { mockApis, seedList } from "./support/mock-api";

/** Automated WCAG 2.1 A/AA checks with axe (the engine behind Lighthouse's accessibility audit). */
const ROUTES = ["/", "/continue", "/discover", "/list", "/anime/1", "/anime/14", "/stats"];

for (const [label, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test(`no WCAG A/AA violations on ${label}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await mockApis(page);
    await seedList(page, sampleList());
    for (const route of ROUTES) {
      await page.goto(route);
      await page.locator("main h1:visible").waitFor();
      await page.waitForTimeout(500);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .include("main")
        .include(".topstrip")
        .analyze();
      const summary = violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      expect(summary, `${route} on ${label}`).toEqual([]);
    }
  });
}
