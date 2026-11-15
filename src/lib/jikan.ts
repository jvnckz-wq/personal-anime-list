import { DETAIL_TTL, LIST_TTL, cachedRequest, createQueue } from "./api-core";
import type { Browse, Page, TypeFilter } from "./anime-types";
import type { AnimeDetail, AnimeSummary, Character } from "./types";

/**
 * Jikan (MyAnimeList data), the fallback source. Jikan allows 3 requests a second and 60 a minute,
 * so its calls share one queue, results are cached, and a 429 is retried with backoff.
 */
const BASE = process.env.NEXT_PUBLIC_JIKAN_BASE ?? "https://api.jikan.moe/v4";
const queued = createQueue(3, 60);
const get = <T>(path: string, ttl: number) => cachedRequest<T>("jikan:" + path, ttl, queued, () => fetch(BASE + path));

/* ---------- Response shapes (only the fields PAL reads) ---------- */
interface RawImages {
  webp?: { image_url?: string | null; large_image_url?: string | null };
  jpg?: { image_url?: string | null; large_image_url?: string | null };
}
interface RawAnime {
  mal_id: number;
  title: string;
  title_english?: string | null;
  images?: RawImages;
  type?: string | null;
  episodes?: number | null;
  duration?: string | null;
  genres?: { name: string }[];
  synopsis?: string | null;
  season?: string | null;
  year?: number | null;
  studios?: { name: string }[];
  trailer?: { youtube_id?: string | null; embed_url?: string | null } | null;
}
interface RawPage<T> {
  data: T[];
  pagination?: { has_next_page?: boolean };
}

const image = (i?: RawImages) =>
  i?.webp?.large_image_url ?? i?.jpg?.large_image_url ?? i?.webp?.image_url ?? i?.jpg?.image_url ?? null;

/** "24 min per ep" → 24, "1 hr 46 min" → 106. Unknown durations count as 24 minutes. */
export function parseDuration(text?: string | null) {
  if (!text) return 24;
  const h = /(\d+)\s*hr/.exec(text);
  const m = /(\d+)\s*min/.exec(text);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return total > 0 ? total : 24;
}

function toSummary(a: RawAnime): AnimeSummary {
  return {
    malId: a.mal_id,
    title: a.title_english || a.title,
    imageUrl: image(a.images),
    type: a.type ?? "Unknown",
    episodes: a.episodes ?? null,
    durationMin: parseDuration(a.duration),
    genres: (a.genres ?? []).map((g) => g.name),
  };
}

function trailerUrl(t: RawAnime["trailer"]) {
  if (t?.youtube_id) return `https://www.youtube-nocookie.com/embed/${t.youtube_id}`;
  if (t?.embed_url) return t.embed_url.replace(/([?&])autoplay=1&?/, "$1");
  return null;
}

/** Jikan can repeat an entry across pages; keep the first. */
const unique = (items: AnimeSummary[]) => {
  const seen = new Set<number>();
  return items.filter((a) => (seen.has(a.malId) ? false : (seen.add(a.malId), true)));
};

export async function browseAnime(kind: Browse, page: number, type: TypeFilter, genreId = 0): Promise<Page<AnimeSummary>> {
  if (genreId) {
    // The season and top lists can't filter by genre, so a genre browse asks the catalog search instead.
    const params = new URLSearchParams({ genres: String(genreId), sfw: "true", page: String(page), sort: "desc" });
    if (kind === "top") params.set("order_by", "score");
    else {
      params.set("order_by", "members");
      params.set("status", kind === "season" ? "airing" : "upcoming");
    }
    if (type) params.set("type", type);
    const res = await get<RawPage<RawAnime>>(`/anime?${params}`, LIST_TTL);
    return { items: unique(res.data.map(toSummary)), hasNext: !!res.pagination?.has_next_page };
  }
  const base = kind === "top" ? "/top/anime" : kind === "season" ? "/seasons/now" : "/seasons/upcoming";
  const typeParam = type ? (kind === "top" ? `&type=${type}` : `&filter=${type}`) : "";
  const res = await get<RawPage<RawAnime>>(`${base}?sfw=true&page=${page}${typeParam}`, LIST_TTL);
  return { items: unique(res.data.map(toSummary)), hasNext: !!res.pagination?.has_next_page };
}

export async function searchAnime(q: string, page: number, opts: { genreId?: number; type?: TypeFilter }): Promise<Page<AnimeSummary>> {
  const params = new URLSearchParams({ q, sfw: "true", page: String(page) });
  if (opts.genreId) params.set("genres", String(opts.genreId));
  if (opts.type) params.set("type", opts.type);
  const res = await get<RawPage<RawAnime>>(`/anime?${params}`, LIST_TTL);
  return { items: unique(res.data.map(toSummary)), hasNext: !!res.pagination?.has_next_page };
}

export async function getAnime(id: number): Promise<AnimeDetail> {
  const res = await get<{ data: RawAnime }>(`/anime/${id}/full`, DETAIL_TTL);
  const a = res.data;
  return {
    ...toSummary(a),
    synopsis: a.synopsis?.replace(/\s*\[Written by MAL Rewrite\]\s*$/, "") ?? null,
    season: a.season ?? null,
    year: a.year ?? null,
    studios: (a.studios ?? []).map((s) => s.name),
    trailerEmbedUrl: trailerUrl(a.trailer),
  };
}

export async function getCharacters(id: number): Promise<Character[]> {
  const res = await get<{ data: { character: { mal_id: number; name: string; images?: RawImages }; role: string }[] }>(`/anime/${id}/characters`, DETAIL_TTL);
  return res.data
    .slice()
    .sort((a, b) => Number(b.role === "Main") - Number(a.role === "Main"))
    .slice(0, 8)
    .map((c) => ({ id: c.character.mal_id, name: c.character.name.split(", ").reverse().join(" "), imageUrl: image(c.character.images), role: c.role }));
}

export async function getRecommendations(id: number): Promise<AnimeSummary[]> {
  const res = await get<{ data: { entry: { mal_id: number; title: string; images?: RawImages } }[] }>(`/anime/${id}/recommendations`, DETAIL_TTL);
  return res.data.slice(0, 4).map((r) => ({
    malId: r.entry.mal_id,
    title: r.entry.title,
    imageUrl: image(r.entry.images),
    type: "",
    episodes: null,
    durationMin: 24,
    genres: [],
  }));
}
