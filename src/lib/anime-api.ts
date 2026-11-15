import { ApiError, MINUTE } from "./api-core";
import * as anilist from "./anilist";
import { GENRES, type Browse, type Page, type TypeFilter } from "./anime-types";
import * as jikan from "./jikan";
import type { AnimeDetail, AnimeSummary, Character } from "./types";

/**
 * The one door screens use for anime data. AniList answers first; if it fails, Jikan is asked instead.
 * When AniList is unreachable or overloaded, it is skipped for two minutes so every call doesn't wait on it.
 * Set NEXT_PUBLIC_ANILIST_URL=off to use Jikan only.
 */
export { errorMessage } from "./api-core";
export { GENRES };
export type { Browse, Page, TypeFilter };

const ANILIST_ON = process.env.NEXT_PUBLIC_ANILIST_URL !== "off";
let skipAniListUntil = 0;

async function pick<T>(primary: () => Promise<T>, backup: () => Promise<T>): Promise<T> {
  if (!ANILIST_ON || Date.now() < skipAniListUntil) return backup();
  try {
    return await primary();
  } catch (err) {
    if (err instanceof ApiError && (err.status === 0 || err.status === 429 || err.status >= 500)) skipAniListUntil = Date.now() + 2 * MINUTE;
    try {
      return await backup();
    } catch {
      throw err;
    }
  }
}

const genreName = (id: number) => GENRES.find((g) => g.id === id)?.name;

export const browseAnime = (kind: Browse, page: number, type: TypeFilter, genreId = 0): Promise<Page<AnimeSummary>> =>
  pick(
    () => anilist.browseAnime(kind, page, type, genreName(genreId)),
    () => jikan.browseAnime(kind, page, type, genreId),
  );

export const searchAnime = (q: string, page: number, opts: { genreId?: number; type?: TypeFilter }): Promise<Page<AnimeSummary>> =>
  pick(
    () => anilist.searchAnime(q, page, { genre: opts.genreId ? genreName(opts.genreId) : undefined, type: opts.type }),
    () => jikan.searchAnime(q, page, opts),
  );

export const getAnime = (id: number): Promise<AnimeDetail> =>
  pick(
    () => anilist.getAnime(id),
    () => jikan.getAnime(id),
  );

export const getCharacters = (id: number): Promise<Character[]> =>
  pick(
    () => anilist.getCharacters(id),
    () => jikan.getCharacters(id),
  );

export const getRecommendations = (id: number): Promise<AnimeSummary[]> =>
  pick(
    () => anilist.getRecommendations(id),
    () => jikan.getRecommendations(id),
  );
