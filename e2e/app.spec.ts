import { expect, test } from "@playwright/test";
import { sampleList } from "./support/catalog";
import { mockApis, savedList, seedList } from "./support/mock-api";

/* Next keeps visited routes in the DOM (hidden), so every locator targets visible elements only. */
const toast = (p: import("@playwright/test").Page) => p.locator("#toast-msg");
const cards = (p: import("@playwright/test").Page) => p.locator("#results .slot:visible");

test.beforeEach(async ({ page }) => {
  await mockApis(page, { failUpcomingOnce: true });
});

test("empty Continue explains files and points to New game", async ({ page }) => {
  await page.goto("/continue");
  await expect(page.getByRole("heading", { name: "Nothing in progress" })).toBeVisible();
  await expect(page.getByText("Every game you save gets its own file number")).toBeVisible();
  await page.keyboard.press("2");
  await expect(page).toHaveURL(/\/discover$/);
});

test("New game: browse, genre, search, new files, error and retry", async ({ page }) => {
  await page.goto("/discover");
  await expect(cards(page)).toHaveCount(8);

  await page.locator(".chip:visible", { hasText: "Sports" }).click();
  await expect(page).toHaveURL(/genre=30/);
  await expect(cards(page)).toHaveCount(2);
  await page.locator(".chip:visible", { hasText: "All" }).click();
  await expect(cards(page)).toHaveCount(8);

  await cards(page).filter({ hasText: "Frieren" }).getByRole("button", { name: /Save game/ }).click();
  await expect(toast(page)).toContainText("File 01: Frieren");
  await expect(cards(page).filter({ hasText: "Frieren" }).locator(".status-tag")).toHaveText("Watching");

  const search = page.locator("#q:visible");
  await search.fill("vin");
  await expect(page).toHaveURL(/q=vin/);
  await expect(search).not.toHaveCSS("color", await search.evaluate((el) => getComputedStyle(el.closest("form")!).backgroundColor));
  await cards(page).filter({ hasText: "Vinland" }).getByRole("button", { name: /Save game/ }).click();
  await expect(toast(page)).toContainText("File 02");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(page).not.toHaveURL(/q=/);

  await page.getByRole("tab", { name: "Upcoming" }).click();
  await expect(page.getByRole("heading", { name: "Couldn't load Upcoming" })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(cards(page).first()).toBeVisible();

  await page.locator("#q:visible").fill("zzz");
  await expect(page.getByRole("heading", { name: /No anime matches/ })).toBeVisible();
});

test("opening a file right after typing a search is not undone by the pending search", async ({ page }) => {
  await page.goto("/discover");
  await expect(cards(page)).toHaveCount(8);
  await page.locator("#q:visible").fill("frieren");
  await cards(page).filter({ hasText: "Frieren" }).first().click(); // within the 400ms debounce
  await expect(page).toHaveURL(/\/anime\/1$/);
  await page.waitForTimeout(800);
  await expect(page).toHaveURL(/\/anime\/1$/);
});

test("Continue: one-tap logging, undo, keyboard cursor, CLEAR in place", async ({ page }) => {
  await seedList(page, sampleList());
  await page.keyboard.press("1");
  await expect(page).toHaveURL(/\/continue$/);
  const hero = page.locator("main .slot.hero:visible");
  await expect(hero).toBeFocused();
  await expect(hero.locator(".file-no")).toContainText("03");

  await hero.getByRole("button", { name: /Watched EP 13/ }).click();
  await expect(toast(page)).toHaveText(/Frieren: episode 13 logged/);
  await page.locator("body").press("u");
  await expect(hero.locator(".ep-line")).toContainText("Episode 12 of 28");

  await hero.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("main .slot.row:visible").first()).toBeFocused();
  await page.keyboard.press("+");
  await expect(toast(page)).toContainText("Dandadan: episode 6 logged");
  await expect(hero.locator(".hero-title")).toContainText("Frieren"); // order stays steady

  const chainsaw = page.locator("main .slot.row:visible", { hasText: "Chainsaw Man" });
  await chainsaw.getByRole("button", { name: /\+1 EP/ }).click();
  await expect(chainsaw.locator(".stamp")).toBeVisible();
  await expect(toast(page)).toContainText("Chainsaw Man cleared. File 08 stamped.");
  await expect(page.locator("main .slot:visible", { hasText: "Chainsaw Man" })).toHaveCount(0, { timeout: 4000 });
});

test("Files: tabs, find a file, start a planned file", async ({ page }) => {
  await seedList(page, sampleList());
  await page.keyboard.press("3");
  await expect(page).toHaveURL(/\/list$/);
  await expect(page.locator("main .slot:visible").first()).toBeFocused();

  await page.getByRole("tab", { name: /Watching/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Cleared/ })).toBeFocused();
  await expect(page.locator("#files-body .slot:visible")).toHaveCount(2);

  await page.locator("#find:visible").fill("bebop");
  await expect(page.locator("#files-body .slot:visible")).toHaveCount(1);
  await page.locator("#find:visible").press("Escape");
  await expect(page.locator("#find:visible")).toHaveValue("");

  await page.getByRole("tab", { name: /Plan to watch/ }).click();
  await page.locator("#files-body .slot:visible", { hasText: "Vinland" }).getByRole("button", { name: /Start watching/ }).click();
  await expect(toast(page)).toContainText("Vinland Saga moved to Watching");
});

test("File details: status side effects, score, delete with undo", async ({ page }) => {
  await seedList(page, sampleList());
  await page.goto("/anime/7");
  await expect(page.getByRole("heading", { level: 1, name: "Cowboy Bebop" })).toBeVisible();
  await expect(page.locator(".char-name:visible").first()).toContainText("Character");

  await page.locator(".panel select:visible").selectOption("watching");
  await expect(toast(page)).toContainText("set to episode 25 of 26");
  await page.locator(".panel select:visible").selectOption("dropped");
  expect((await savedList(page)).find((e) => e.malId === 7)?.episodesWatched).toBe(25);

  await page.getByRole("radio", { name: "Score 7" }).check();
  await expect(toast(page)).toContainText("score 7 saved");

  await page.getByRole("button", { name: "Delete file" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Delete file 02?" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "No" })).toBeFocused();
  await dialog.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page).not.toHaveURL(/\/anime\/7/);
  expect((await savedList(page)).some((e) => e.malId === 7)).toBe(false);
  await page.locator("body").press("u");
  await expect.poll(async () => (await savedList(page)).find((e) => e.malId === 7)?.fileNo).toBe(2);
});

test("File details: not a file yet offers Save game and Plan to watch; Esc goes back", async ({ page }) => {
  await seedList(page, sampleList());
  await page.keyboard.press("1");
  await page.locator("main .slot.hero:visible").press("Enter");
  await expect(page).toHaveURL(/\/anime\/1$/);
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/continue$/);
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/anime/14");
  await page.getByRole("button", { name: "Save game" }).click();
  await expect(toast(page)).toContainText("File 11");
  await expect(page.locator(".panel .file-no:visible")).toContainText("11");
});

test("Records: play record, cleared wall, data survives a reload", async ({ page }) => {
  await seedList(page, sampleList());
  await page.keyboard.press("4");
  await expect(page.getByRole("heading", { name: "Total play time" })).toBeVisible();
  await expect(page.locator(".wall .stamp:visible")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".wall .stamp:visible")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
});

test("Title screen: menu cursor, + logs the latest save, Esc comes back to the same entry", async ({ page }) => {
  await seedList(page, sampleList());
  const items = page.locator(".t-menu .m-item:visible");
  await expect(items.first()).toBeFocused();
  await expect(page.locator(".slip .slip-title")).toContainText("Frieren");
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await expect(items.nth(1)).toHaveClass(/(^| )on( |$)/);
  await page.keyboard.press("+");
  await expect(toast(page)).toHaveText(/Frieren: episode 13 logged/);
  await expect(page.locator(".slip .ep-line")).toContainText("Episode 13 of 28");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/discover$/);
  await expect(cards(page).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".t-menu .m-item:visible").nth(1)).toBeFocused();
});

test("/ from any screen opens New game with the search focused", async ({ page }) => {
  await seedList(page, sampleList());
  await page.locator("body").press("/");
  await expect(page).toHaveURL(/\/discover/);
  await expect(page.locator("#q:visible")).toBeFocused();
});
