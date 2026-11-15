import type { ListEntry, Status } from "../types";
import { STATUS_ORDER } from "../types";

/**
 * Every read and write of the owner's list goes through this interface, so a database-backed
 * store (phase 2) can replace browser storage without touching any screen.
 */
export interface ListStore {
  getAll(): Promise<ListEntry[]>;
  get(malId: number): Promise<ListEntry | null>;
  upsert(entry: ListEntry): Promise<void>;
  remove(malId: number): Promise<void>;
  exportJson(): Promise<string>;
  importJson(json: string): Promise<void>;
}

export class StoreError extends Error {}

const isStatus = (v: unknown): v is Status => typeof v === "string" && (STATUS_ORDER as string[]).includes(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string";

/** Validates one stored or imported entry. Returns null when the shape is wrong. */
function parseEntry(raw: unknown): ListEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  const total = e.totalEpisodes === null ? null : isNum(e.totalEpisodes) ? e.totalEpisodes : undefined;
  const score = e.score === null ? null : isNum(e.score) ? e.score : undefined;
  if (
    !isNum(e.malId) || !isNum(e.fileNo) || !isStr(e.title) || !isStr(e.type) || total === undefined ||
    !isStatus(e.status) || !isNum(e.episodesWatched) || score === undefined || !isStr(e.addedAt) || !isStr(e.updatedAt)
  ) {
    return null;
  }
  if (score !== null && (score < 1 || score > 10)) return null;
  if (e.episodesWatched < 0 || (total !== null && e.episodesWatched > total)) return null;
  return {
    malId: e.malId,
    fileNo: e.fileNo,
    title: e.title,
    imageUrl: isStr(e.imageUrl) ? e.imageUrl : null,
    type: e.type,
    totalEpisodes: total,
    durationMin: isNum(e.durationMin) && e.durationMin > 0 ? e.durationMin : 24,
    genres: Array.isArray(e.genres) ? e.genres.filter(isStr) : [],
    status: e.status,
    episodesWatched: e.episodesWatched,
    score,
    addedAt: e.addedAt,
    updatedAt: e.updatedAt,
  };
}

/** Accepts a PAL backup or stored list. Returns null if anything in it is invalid. */
export function parseList(data: unknown): ListEntry[] | null {
  if (!data || typeof data !== "object") return null;
  const entries = (data as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return null;
  const parsed = entries.map(parseEntry);
  if (parsed.some((e) => e === null)) return null;
  const list = parsed as ListEntry[];
  const ids = new Set(list.map((e) => e.malId));
  return ids.size === list.length ? list : null;
}
