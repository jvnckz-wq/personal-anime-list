export type Status = "watching" | "completed" | "plan_to_watch" | "dropped";

/** One file in the owner's list. Holds enough to render Continue, Files and Records without the API. */
export interface ListEntry {
  malId: number;
  /** Permanent save-slot number, assigned once when the file is created. */
  fileNo: number;
  title: string;
  imageUrl: string | null;
  type: string;
  totalEpisodes: number | null;
  /** Minutes per episode, used for play time. */
  durationMin: number;
  genres: string[];
  status: Status;
  episodesWatched: number;
  score: number | null;
  addedAt: string;
  /** Last saved: every change updates it. */
  updatedAt: string;
}

/** What the API gives for a card or a search result. */
export interface AnimeSummary {
  malId: number;
  title: string;
  imageUrl: string | null;
  type: string;
  episodes: number | null;
  durationMin: number;
  genres: string[];
}

export interface AnimeDetail extends AnimeSummary {
  synopsis: string | null;
  season: string | null;
  year: number | null;
  studios: string[];
  trailerEmbedUrl: string | null;
}

export interface Character {
  id: number;
  name: string;
  imageUrl: string | null;
  role: string;
}

export const STATUS_ORDER: Status[] = ["watching", "completed", "plan_to_watch", "dropped"];

/** Interface wording uses the save-file vocabulary: completed shows as Cleared. */
export const STATUS_LABEL: Record<Status, string> = {
  watching: "Watching",
  completed: "Cleared",
  plan_to_watch: "Plan to watch",
  dropped: "Dropped",
};
