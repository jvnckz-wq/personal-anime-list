import { expect, test } from "@playwright/test";

/** Live smoke test against the real AniList API. Run with `npm run test:e2e:live`. */
const cards = (p: import("@playwright/test").Page) => p.locator("#results .slot:visible");

test("live AniList: browse, search, new file, details, trailer", async ({ page }) => {
  await page.goto("/discover");
  await expect(cards(page).nth(7)).toBeVisible({ timeout: 20_000 });
  await expect(cards(page).first().locator("img")).toHaveAttribute("src", /anilist\.co/);

  await page.getByRole("tab", { name: "This season" }).click();
  await expect(cards(page).first()).toBeVisible({ timeout: 20_000 });
  await page.getByRole("tab", { name: "Top rated" }).click();

  await page.locator("#q:visible").fill("frieren");
  const frieren = cards(page).filter({ hasText: "Frieren" }).first();
  await expect(frieren).toBeVisible({ timeout: 20_000 });
  await frieren.getByRole("button", { name: /Save game/ }).click();
  await expect(page.locator("#toast-msg")).toContainText("File 01");

  await frieren.click();
  await expect(page.getByRole("heading", { level: 1, name: /Frieren/ })).toBeVisible();
  await expect(page.locator(".about p:visible")).toHaveText(/.{80,}/, { timeout: 20_000 });
  await expect(page.locator(".chars img:visible").first()).toBeVisible();
  await page.getByRole("button", { name: "Watch trailer" }).click();
  await expect(page.locator("dialog[open] iframe")).toHaveAttribute("src", /youtube/);
});
