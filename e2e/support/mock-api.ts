import type { Page } from "@playwright/test";
import { CATALOG, GENRE_IDS, type Sample } from "./catalog";

const CORS = { "Access-Control-Allow-Origin": "*" };

function raw(a: Sample) {
  return {
    mal_id: a.id,
    title: a.title,
    title_english: null,
    images: { webp: { image_url: null, large_image_url: null } },
    type: a.type,
    episodes: a.episodes,
    duration: a.duration,
    season: a.season,
    year: a.year,
    studios: [{ name: a.studio }],
    genres: a.genres.map((g) => ({ name: g, mal_id: GENRE_IDS[g] })),
    synopsis: `Sample synopsis for ${a.title}. [Written by MAL Rewrite]`,
    trailer: { youtube_id: a.id === 10 || a.id === 20 ? null : "dQw4w9WgXcQ", embed_url: null },
  };
}

function page(items: Sample[], params: URLSearchParams) {
  const p = Number(params.get("page") ?? 1);
  const size = 8;
  return { data: items.slice((p - 1) * size, p * size).map(raw), pagination: { has_next_page: p * size < items.length, current_page: p } };
}

/**
 * Mocks the anime APIs inside the browser so tests run offline and deterministically.
 * AniList is made unreachable (which also exercises the Jikan fallback), and Jikan answers
 * from the sample catalog. The first Upcoming request fails once, to show the error state.
 */
export async function mockApis(p: Page, opts: { failUpcomingOnce?: boolean } = {}) {
  await p.route("https://graphql.anilist.co/**", (route) => route.abort("connectionrefused"));
  let upcomingCalls = 0;
  await p.route("https://api.jikan.moe/v4/**", (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/v4/, "");
    const q = url.searchParams;
    const type = q.get("type") ?? q.get("filter") ?? "";
    const byType = (items: Sample[]) => items.filter((a) => !type || a.type.toLowerCase() === type);
    const json = (body: unknown, status = 200) => route.fulfill({ status, json: body, headers: CORS });
    if (path === "/top/anime") return json(page(byType(CATALOG), q));
    if (path === "/seasons/now") return json(page(byType(CATALOG.filter((a) => a.lists.includes("season"))), q));
    if (path === "/seasons/upcoming") {
      upcomingCalls += 1;
      if (opts.failUpcomingOnce && upcomingCalls === 1) return json({ status: 500, message: "mock failure" }, 500);
      return json(page(byType(CATALOG.filter((a) => a.lists.includes("upcoming"))), q));
    }
    if (path === "/anime") {
      const term = (q.get("q") ?? "").toLowerCase();
      const genre = Number(q.get("genres") ?? 0);
      return json(page(byType(CATALOG).filter((a) => a.title.toLowerCase().includes(term) && (!genre || a.genres.some((g) => GENRE_IDS[g] === genre))), q));
    }
    const m = /^\/anime\/(\d+)\/(full|characters|recommendations)$/.exec(path);
    if (m) {
      const a = CATALOG.find((x) => x.id === Number(m[1]));
      if (!a) return json({ status: 404 }, 404);
      if (m[2] === "full") return json({ data: raw(a) });
      if (m[2] === "characters")
        return json({
          data: [0, 1, 2, 3].map((i) => ({ character: { mal_id: a.id * 100 + i, name: `Lead, Character ${i}`, images: { webp: { image_url: null } } }, role: i < 2 ? "Main" : "Supporting" })),
        });
      const recs = CATALOG.filter((x) => x.id !== a.id && x.genres.some((g) => a.genres.includes(g))).slice(0, 4);
      return json({ data: recs.map((x) => ({ entry: { mal_id: x.id, title: x.title, images: { webp: { image_url: null } } } })) });
    }
    return json({ status: 404 }, 404);
  });
}

/** Saves a list into this browser, the same way the app stores it. */
export async function seedList(p: Page, entries: unknown[]) {
  await p.goto("/");
  await p.evaluate((list) => localStorage.setItem("pal:list:v1", JSON.stringify({ version: 1, entries: list })), entries);
  await p.reload();
  await appReady(p);
}

/** Waits until the app has hydrated (the shell marks the current screen), so keys and clicks are handled. */
export const appReady = (p: Page) => p.waitForFunction(() => !!document.body.dataset.screen && !!document.querySelector("main h1"));

/** The list exactly as stored in this browser. */
export const savedList = (p: Page) =>
  p.evaluate(() => (JSON.parse(localStorage.getItem("pal:list:v1") ?? '{"entries":[]}') as { entries: { malId: number; fileNo: number; status: string; episodesWatched: number; score: number | null }[] }).entries);
