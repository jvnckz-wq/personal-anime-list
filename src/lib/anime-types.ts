/** Shapes shared by every anime data source. */

export type Browse = "season" | "top" | "upcoming";
export type TypeFilter = "" | "tv" | "movie" | "ova";

export interface Page<T> {
  items: T[];
  hasNext: boolean;
}

/** Genre chips. `id` is the MyAnimeList/Jikan genre id; `name` matches AniList's genre names. */
export const GENRES: { id: number; name: string }[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 7, name: "Mystery" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 30, name: "Sports" },
  { id: 37, name: "Supernatural" },
];
