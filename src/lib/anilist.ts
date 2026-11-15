import { ApiError, DETAIL_TTL, LIST_TTL, cachedRequest, createQueue } from "./api-core";
import type { Browse, Page, TypeFilter } from "./anime-types";
import type { AnimeDetail, AnimeSummary, Character } from "./types";

/**
 * AniList GraphQL, the primary source. Every anime keeps its MyAnimeList id (idMal) as PAL's id,
 * so AniList and the Jikan fallback agree and saved files stay valid. Entries without an idMal are skipped.
 * AniList allows up to 90 requests a minute (lower while degraded); PAL stays at 2 a second and 30 a minute.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_ANILIST_URL ?? "https://graphql.anilist.co";
const queued = createQueue(2, 30);

async function gql<T>(query: string, variables: Record<string, unknown>, ttl: number): Promise<T> {
  const vars = Object.fromEntries(Object.entries(variables).filter(([, v]) => v !== null && v !== undefined && v !== ""));
  const body = JSON.stringify({ query, variables: vars });
  const res = await cachedRequest<{ data?: T; errors?: { message: string; status?: number }[] }>("anilist:" + body, ttl, queued, () =>
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body }),
  );
  if (!res.data) throw new ApiError(res.errors?.[0]?.status ?? 500, res.errors?.[0]?.message ?? "AniList error");
  return res.data;
}

const CARD = `idMal title { english romaji } coverImage { extraLarge large } format episodes duration genres`;

interface RawMedia {
  idMal: number | null;
  title: { english: string | null; romaji: string | null };
  coverImage: { extraLarge: string | null; large: string | null } | null;
  format: string | null;
  episodes: number | null;
  duration: number | null;
  genres: string[] | null;
}

interface RawDetail extends RawMedia {
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  studios: { nodes: { name: string }[] } | null;
  trailer: { id: string; site: string } | null;
  characters: { edges: { role: string; node: { id: number; name: { full: string }; image: { large: string | null } | null } }[] } | null;
  recommendations: { nodes: { mediaRecommendation: RawMedia | null }[] } | null;
}

const FORMAT: Record<string, string> = { TV: "TV", TV_SHORT: "TV Short", MOVIE: "Movie", SPECIAL: "Special", OVA: "OVA", ONA: "ONA", MUSIC: "Music" };
const TO_FORMAT: Record<Exclude<TypeFilter, "">, string> = { tv: "TV", movie: "MOVIE", ova: "OVA" };

function toSummary(m: RawMedia & { idMal: number }): AnimeSummary {
  return {
    malId: m.idMal,
    title: m.title.english || m.title.romaji || "Untitled",
    imageUrl: m.coverImage?.extraLarge ?? m.coverImage?.large ?? null,
    type: m.format ? (FORMAT[m.format] ?? m.format) : "Unknown",
    episodes: m.episodes ?? null,
    durationMin: m.duration && m.duration > 0 ? m.duration : 24,
    genres: m.genres ?? [],
  };
}

const hasMal = (m: RawMedia | null): m is RawMedia & { idMal: number } => !!m && typeof m.idMal === "number";

function currentSeason(d = new Date()) {
  const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
  return { season: seasons[Math.floor(d.getMonth() / 3)], seasonYear: d.getFullYear() };
}

const PAGE_QUERY = `query ($page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $status: MediaStatus, $genre: String, $format: MediaFormat, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(type: ANIME, isAdult: false, sort: $sort, season: $season, seasonYear: $seasonYear, status: $status, genre: $genre, format: $format, search: $search) { ${CARD} }
  }
}`;

async function page(vars: Record<string, unknown>): Promise<Page<AnimeSummary>> {
  const data = await gql<{ Page: { pageInfo: { hasNextPage: boolean }; media: RawMedia[] } }>(PAGE_QUERY, { perPage: 24, ...vars }, LIST_TTL);
  return { items: data.Page.media.filter(hasMal).map(toSummary), hasNext: data.Page.pageInfo.hasNextPage };
}

export function browseAnime(kind: Browse, pageNo: number, type: TypeFilter, genre?: string) {
  const format = type ? TO_FORMAT[type] : null;
  if (kind === "top") return page({ page: pageNo, sort: ["SCORE_DESC"], genre, format });
  if (kind === "season") return page({ page: pageNo, sort: ["POPULARITY_DESC"], ...currentSeason(), genre, format });
  return page({ page: pageNo, sort: ["POPULARITY_DESC"], status: "NOT_YET_RELEASED", genre, format });
}

export function searchAnime(q: string, pageNo: number, opts: { genre?: string; type?: TypeFilter }) {
  return page({ page: pageNo, search: q, sort: ["SEARCH_MATCH"], genre: opts.genre, format: opts.type ? TO_FORMAT[opts.type] : null });
}

const DETAIL_QUERY = `query ($idMal: Int) {
  Media(idMal: $idMal, type: ANIME) {
    ${CARD}
    description(asHtml: false)
    season seasonYear
    studios(isMain: true) { nodes { name } }
    trailer { id site }
    characters(sort: [ROLE, RELEVANCE, ID], perPage: 8) { edges { role node { id name { full } image { large } } } }
    recommendations(sort: [RATING_DESC], perPage: 8) { nodes { mediaRecommendation { ${CARD} } } }
  }
}`;

/** One query carries the record, characters and recommendations; the three calls below share it. */
async function detail(idMal: number): Promise<RawDetail & { idMal: number }> {
  const data = await gql<{ Media: RawDetail | null }>(DETAIL_QUERY, { idMal }, DETAIL_TTL);
  if (!data.Media || !hasMal(data.Media)) throw new ApiError(404, "not found");
  return data.Media as RawDetail & { idMal: number };
}

const cleanText = (html: string | null) =>
  html
    ? html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : null;

function trailerUrl(t: RawDetail["trailer"]) {
  if (!t) return null;
  if (t.site === "youtube") return `https://www.youtube-nocookie.com/embed/${t.id}`;
  if (t.site === "dailymotion") return `https://www.dailymotion.com/embed/video/${t.id}`;
  return null;
}

export async function getAnime(idMal: number): Promise<AnimeDetail> {
  const m = await detail(idMal);
  return {
    ...toSummary(m),
    synopsis: cleanText(m.description),
    season: m.season ? m.season.toLowerCase() : null,
    year: m.seasonYear ?? null,
    studios: (m.studios?.nodes ?? []).map((s) => s.name),
    trailerEmbedUrl: trailerUrl(m.trailer),
  };
}

export async function getCharacters(idMal: number): Promise<Character[]> {
  const m = await detail(idMal);
  return (m.characters?.edges ?? []).map((e) => ({
    id: e.node.id,
    name: e.node.name.full,
    imageUrl: e.node.image?.large ?? null,
    role: e.role === "MAIN" ? "Main" : e.role === "SUPPORTING" ? "Supporting" : "Background",
  }));
}

export async function getRecommendations(idMal: number): Promise<AnimeSummary[]> {
  const m = await detail(idMal);
  return (m.recommendations?.nodes ?? [])
    .map((n) => n.mediaRecommendation)
    .filter(hasMal)
    .slice(0, 4)
    .map(toSummary);
}
