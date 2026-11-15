import type { ListEntry } from "./types";

export const pad = (n: number) => String(n).padStart(2, "0");

export const initials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

/** The part of a title before a colon, for short toast messages. */
export const shortTitle = (title: string) => title.split(":")[0];

export const episodeText = (watched: number, total: number | null) =>
  total ? `Episode ${watched} of ${total}` : `Episode ${watched}`;

export const percent = (watched: number, total: number | null) =>
  total ? Math.round((watched / total) * 100) : null;

/** Play time as a duration: "4h 48m", or "24m" under an hour. */
export const playClock = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${pad(m)}m` : `${m}m`;
};

export const playTime = (e: Pick<ListEntry, "episodesWatched" | "durationMin">) => playClock(e.episodesWatched * e.durationMin);

export function ago(iso: string, now = Date.now()) {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

export function slotLabel(e: ListEntry) {
  const ep = episodeText(e.episodesWatched, e.totalEpisodes).toLowerCase();
  const score = e.score ? `score ${e.score}` : "no score";
  return `File ${pad(e.fileNo)}, ${e.title}, ${ep}, ${score}${e.status === "completed" ? ", cleared" : ""}. Enter opens the file`;
}
