/** Sample catalog served by the mocked Jikan API. Poster images are left empty on purpose. */
export type Sample = {
  id: number;
  title: string;
  type: string;
  episodes: number | null;
  duration: string;
  season: string | null;
  year: number;
  studio: string;
  genres: string[];
  lists: ("season" | "upcoming")[];
};

export const GENRE_IDS: Record<string, number> = {
  Action: 1, Adventure: 2, Comedy: 4, Drama: 8, Fantasy: 10, Mystery: 7, Romance: 22, "Sci-Fi": 24, Sports: 30, Supernatural: 37,
};

const s = (id: number, title: string, type: string, episodes: number | null, duration: string, season: string | null, year: number, studio: string, genres: string[], lists: Sample["lists"] = []): Sample =>
  ({ id, title, type, episodes, duration, season, year, studio, genres, lists });

export const CATALOG: Sample[] = [
  s(1, "Frieren: Beyond Journey's End", "TV", 28, "24 min per ep", "fall", 2023, "Madhouse", ["Adventure", "Drama", "Fantasy"], ["season"]),
  s(2, "Dandadan", "TV", 12, "24 min per ep", "fall", 2024, "Science SARU", ["Action", "Comedy", "Supernatural"], ["season"]),
  s(3, "Bocchi the Rock!", "TV", 12, "23 min per ep", "fall", 2022, "CloverWorks", ["Comedy"]),
  s(4, "Spy x Family", "TV", 25, "24 min per ep", "spring", 2022, "Wit Studio", ["Action", "Comedy"], ["upcoming"]),
  s(5, "Chainsaw Man", "TV", 12, "24 min per ep", "fall", 2022, "MAPPA", ["Action", "Fantasy"], ["upcoming"]),
  s(6, "One Piece", "TV", null, "24 min per ep", "fall", 1999, "Toei Animation", ["Action", "Adventure", "Fantasy"], ["season"]),
  s(7, "Cowboy Bebop", "TV", 26, "24 min per ep", "spring", 1998, "Sunrise", ["Action", "Sci-Fi"]),
  s(8, "Mob Psycho 100", "TV", 12, "24 min per ep", "summer", 2016, "Bones", ["Action", "Comedy", "Supernatural"]),
  s(9, "Vinland Saga", "TV", 24, "24 min per ep", "summer", 2019, "Wit Studio", ["Action", "Adventure", "Drama"]),
  s(10, "Pluto", "ONA", 8, "1 hr per ep", null, 2023, "Studio M2", ["Drama", "Mystery", "Sci-Fi"], ["season"]),
  s(11, "Kaguya-sama: Love Is War", "TV", 12, "25 min per ep", "winter", 2019, "A-1 Pictures", ["Comedy", "Romance"], ["upcoming"]),
  s(12, "Attack on Titan", "TV", 25, "24 min per ep", "spring", 2013, "Wit Studio", ["Action", "Drama"]),
  s(13, "Steins;Gate", "TV", 24, "24 min per ep", "spring", 2011, "White Fox", ["Drama", "Sci-Fi"]),
  s(14, "Fullmetal Alchemist: Brotherhood", "TV", 64, "24 min per ep", "spring", 2009, "Bones", ["Action", "Adventure", "Drama", "Fantasy"]),
  s(15, "Your Name.", "Movie", 1, "1 hr 46 min", null, 2016, "CoMix Wave Films", ["Drama", "Romance", "Supernatural"]),
  s(16, "Made in Abyss", "TV", 13, "25 min per ep", "summer", 2017, "Kinema Citrus", ["Adventure", "Drama", "Fantasy", "Mystery"], ["season"]),
  s(17, "Haikyu!!", "TV", 25, "24 min per ep", "spring", 2014, "Production I.G", ["Sports"], ["upcoming"]),
  s(18, "Odd Taxi", "TV", 13, "24 min per ep", "spring", 2021, "OLM", ["Drama", "Mystery"]),
  s(19, "Violet Evergarden", "TV", 13, "24 min per ep", "winter", 2018, "Kyoto Animation", ["Drama", "Fantasy"]),
  s(20, "Perfect Blue", "Movie", 1, "1 hr 21 min", null, 1998, "Madhouse", ["Drama", "Mystery"]),
  s(21, "Ping Pong the Animation", "TV", 11, "23 min per ep", "spring", 2014, "Tatsunoko Production", ["Sports"], ["season"]),
  s(22, "Kill la Kill", "TV", 24, "24 min per ep", "fall", 2013, "Trigger", ["Action", "Comedy"], ["upcoming"]),
];

const iso = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600e3).toISOString();

/** A realistic saved list: six in progress, two cleared, two planned. */
export function sampleList() {
  const row = (id: number, fileNo: number, status: string, watched: number, score: number | null, hoursAgo: number) => {
    const a = CATALOG.find((c) => c.id === id)!;
    const dur = /(\d+)\s*hr/.test(a.duration) ? 60 : Number(/(\d+)\s*min/.exec(a.duration)?.[1] ?? 24);
    return {
      malId: id, fileNo, title: a.title, imageUrl: null, type: a.type, totalEpisodes: a.episodes, durationMin: dur, genres: a.genres,
      status, episodesWatched: watched, score, addedAt: iso(hoursAgo + 500), updatedAt: iso(hoursAgo),
    };
  };
  return [
    row(1, 3, "watching", 12, null, 2),
    row(2, 9, "watching", 5, null, 20),
    row(3, 6, "watching", 8, 9, 30),
    row(4, 4, "watching", 20, 8, 72),
    row(5, 8, "watching", 11, null, 120),
    row(6, 1, "watching", 412, 9, 216),
    row(7, 2, "completed", 26, 10, 960),
    row(8, 5, "completed", 12, 9, 1440),
    row(9, 7, "plan_to_watch", 0, null, 288),
    row(10, 10, "plan_to_watch", 0, null, 336),
  ];
}
