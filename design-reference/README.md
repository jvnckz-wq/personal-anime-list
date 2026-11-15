# Pila: Anime Watchlist

A personal anime watchlist web app. Users search and browse anime, add titles to a list, track episode progress, score what they watch, and see stats about their viewing.

This is a portfolio project for a UI/UX designer and frontend developer, so visual polish, interaction quality, and accessibility matter as much as features.

"Pila" (Filipino for "queue") is a working name.

## How to use this document

This README is the build brief. The folder `design-reference/` holds five mockup files, one per screen, exported from the design canvas:

- `E-Home.dc.html`
- `E-MyList.dc.html`
- `E-Discover.dc.html`
- `E-Detail.dc.html`
- `E-Stats.dc.html`

The mockups will not render on their own (they depend on a canvas runtime), but their markup and inline styles are the source of truth for layout, spacing, sizes, and colours. Read them for exact values. Rebuild them as proper React components; do not copy the inline styles as they are.

Where this README and a mockup disagree, follow the mockup for visuals and this README for behaviour.

## Tech stack

- Next.js (App Router) with React and TypeScript
- Tailwind CSS, with the design tokens below set up in the theme
- Deployed on Vercel
- No backend in phase 1

## Scope

### Phase 1 (build this)

- No accounts and no login. The app is usable immediately.
- Anime data comes from the Jikan API.
- The user's list is saved in the browser with `localStorage`.
- Export and import of the list as a JSON file, as a safeguard against cleared browser data.

### Phase 2 (do not build yet, but prepare for it)

- Accounts (Google sign-in) with the list stored in PostgreSQL through Prisma.

To make phase 2 a drop-in change, all reads and writes of the user's list must go through one storage interface (see "Storage"). No component may touch `localStorage` directly.

### Out of scope

- Social features, comments, or public profiles
- Manga
- Streaming or links to streaming sites
- Notifications

## Build order

Build the frontend first and wire data in afterwards.

1. Project setup, design tokens, fonts, and the shared layout (sidebar and page shell).
2. Shared components (see "Components").
3. All five screens with hard-coded sample data taken from the mockups.
4. The storage layer, then connect My List, Stats, and the tracking controls.
5. The Jikan API layer, then connect Discover, Home, and Anime Detail.
6. Loading, empty, and error states on every screen.
7. Phone and tablet layouts.
8. Motion and final polish.

## Design direction: "game menu"

The interface should feel like the menu system of a stylish JRPG: slanted panels, sharp cut corners, bold italic type, one bright accent on dark navy, and confident transitions. It must still be easy to read and use. When style and clarity conflict, clarity wins.

### Colours

| Token | Hex | Use |
| --- | --- | --- |
| `bg` | `#0B1220` | Page background |
| `panel` | `#16233A` | Panels, inactive menu items, list rows |
| `track` | `#2A3B58` | Progress track, "already in list" buttons |
| `line` | `#3A4C6B` | Borders on inputs, chips, selects |
| `text` | `#E8F1F8` | Primary text |
| `muted` | `#A9BDD1` | Labels and secondary text |
| `accent` | `#3DF2E0` | Active state, primary buttons, progress fill |
| `on-accent` | `#06131A` | Text on accent backgrounds |
| `mid` | `#6C86A8` | Third segment in the status chart |

Use only these. Poster art supplies all other colour.

### Typography

- One family for everything: **Chakra Petch** (Google Fonts), weights 500 and 700, plus 700 italic.
- Page titles: 60px, 700 italic, uppercase, letter-spacing 2px.
- Anime titles in hero areas: 46 to 50px, 700 italic, sentence case.
- Section labels: 20px, 700, uppercase, letter-spacing 4px, `muted`.
- Small labels: 13 to 15px, 700, uppercase, letter-spacing 2px, `muted`.
- Body text: 16 to 17px, weight 500, line-height 1.6.

### Shape language

- **Skew:** buttons, tabs, menu items, and the search box are skewed `-10deg` on the X axis. Text inside is counter-skewed `10deg` so it stays upright.
- **Progress bars:** two skewed segments (`-20deg`) with a 4px gap: filled in `accent`, remainder in `track`. The flex ratio of the segments is watched to remaining.
- **Cut corners:** panels and list rows clip their bottom-right corner with `clip-path`.
- **Parallelogram posters:** poster thumbnails in grids use `clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%)`. Large hero posters are skewed `-6deg` instead.
- **No rounded corners, no shadows, no gradients, no glass or blur.**
- **Index numbers:** list rows and "Up Next" cards carry large italic numbers (01, 02, 03).

### Motion

- Page transitions: content slides in on a diagonal, 200 to 300ms.
- Menu and tabs: the accent block slides between items.
- Buttons: a small shift on hover and press.
- "+1 EP": the progress bar animates and the number ticks up.
- Respect `prefers-reduced-motion` by turning these into simple fades.

## Layout

Desktop (1024px and up):

- Content is centred with a maximum width of 1280px and 48px padding.
- Left sidebar about 260px wide; main content fills the rest; 48px gap.
- Sidebar, top to bottom: the logo (`PILA.` with the full stop in accent, 64px italic), four menu items, then the search box. Each menu item is indented 18px further than the one above, giving a staggered edge.
- Menu items: `01 HOME`, `02 DISCOVER`, `03 MY LIST`, `04 STATS`. The active item uses `accent` with `on-accent` text; the others use `panel`.

Tablet and phone (below 1024px):

- This layout has not been designed yet. Proposed approach: replace the sidebar with a fixed bottom bar holding the four menu items, move search to the top of each page, and stack all multi-column sections into one column.
- Build it this way, keep the skewed style, and flag it for review.
- Touch targets are at least 44px.

## Screens

### 1. Home (`/`)

Reference: `E-Home.dc.html`

- **Continue Watching hero:** the most recently updated anime with status Watching. Shows the poster, title, `EPISODE x / y`, the progress bar, a `CONTINUE` button (adds one episode), and a `DETAILS` button (opens the detail page).
- **Up Next:** the other anime with status Watching as numbered parallelogram cards with title and `EP x / y`. Each links to its detail page.
- **Empty state:** when nothing is being watched, replace both sections with a short message and a button to Discover.

### 2. Discover (`/discover`)

Reference: `E-Discover.dc.html`

- **Search:** a large skewed search box with an accent border. Debounce input by about 400ms. Search replaces the browse results.
- **Browse tabs:** This Season, Top Rated, Upcoming. Top Rated is the default.
- **Filters (in the sidebar on this screen only):** genre chips with a single selection, plus a type select (All types, TV, Movie, OVA).
- **Result cards:** parallelogram poster, title (links to detail), type and episode count, and one button:
  - Not in the list: `+ ADD` in accent. Adds with status Plan to Watch.
  - Already in the list: shows the current status (for example `WATCHING`) in `track`, and opens the detail page.
- **Load More** button at the bottom, not numbered pages.
- **No results:** a clear message with the search term and a way to clear it.

### 3. My List (`/list`)

Reference: `E-MyList.dc.html`

- **Status tabs:** Watching, Completed, Plan to Watch, Dropped. Each shows its count.
- **Sort select:** Recently updated (default), Title, Progress, My score.
- **Rows:** index number, poster, title (links to detail), `EP x / y` with the progress bar, the user's score (or `--` when unrated), a `+1 EP` button, and an `EDIT` button.
- **`+1 EP`:** adds one episode. When the count reaches the total, set the status to Completed and move the row to that tab with a brief confirmation.
- **`EDIT`:** opens a small panel to change status, episode count, and score, or remove the anime from the list. Removing asks for confirmation.
- **Empty state per tab**, with a button to Discover.
- **Export and Import** buttons for the list as JSON.

### 4. Anime Detail (`/anime/[id]`)

Reference: `E-Detail.dc.html`

- **Header:** back link, large skewed poster, title, a meta row (type, episodes, season and year, studio), genre tags, synopsis, and a `WATCH TRAILER` button that opens the trailer in a modal. Hide the button when there is no trailer.
- **Tracking panel:** a status select, an episode stepper (minus, `x / y`, plus), and a score picker from 1 to 10. Changes save immediately.
  - When the anime is not in the list, show one `+ ADD TO LIST` button in place of the panel.
- **Characters:** main characters with image and name.
- **You Might Also Like:** recommendations as parallelogram cards linking to their detail pages. Hide the section when there are none.

### 5. Stats (`/stats`)

Reference: `E-Stats.dc.html`

All values are computed from the user's list.

- **Totals:** anime in list, episodes watched, completed, mean score (of scored entries only, one decimal).
- **By Status:** one segmented skewed bar with a legend showing each status and its count.
- **Top Genres:** the five most common genres as horizontal bars with counts.
- **My Scores:** a column chart of how many times each score was given.
- **Empty state:** when the list is empty, show a message and a button to Discover in place of the charts.
- Charts are built with plain HTML and CSS, as in the mockup. Do not add a chart library.
- Every chart needs a text alternative, and segments must differ in lightness, not only in hue.

## Data

### Jikan API

- Base URL: `https://api.jikan.moe/v4`
- Free, no API key, read-only. Docs: https://docs.api.jikan.moe
- Rate limit: 3 requests per second and 60 per minute. Requests over the limit return HTTP 429.

Endpoints this app needs. Confirm each against the docs before relying on it:

| Purpose | Endpoint |
| --- | --- |
| Search | `/anime?q={query}&page={n}` |
| Top rated | `/top/anime?page={n}` |
| This season | `/seasons/now?page={n}` |
| Upcoming | `/seasons/upcoming?page={n}` |
| Genre list | `/genres/anime` |
| Anime details | `/anime/{id}` |
| Characters | `/anime/{id}/characters` |
| Recommendations | `/anime/{id}/recommendations` |

Requirements for the API layer:

- Put every call in one module (for example `lib/jikan.ts`) with typed responses.
- Queue requests so the app never exceeds the rate limit.
- Cache responses (anime details for a long time, browse lists for a few minutes).
- On 429, retry with backoff up to three times, then show an error state with a retry button.
- Never call the API from more than one place for the same data on one page.

### User list entry

```ts
type Status = "watching" | "completed" | "plan_to_watch" | "dropped";

interface ListEntry {
  malId: number;            // anime id from Jikan
  title: string;
  imageUrl: string;
  type: string;             // TV, Movie, OVA
  totalEpisodes: number | null;  // null while still airing or unknown
  genres: string[];
  status: Status;
  episodesWatched: number;
  score: number | null;     // 1 to 10
  addedAt: string;          // ISO date
  updatedAt: string;        // ISO date
}
```

Store enough of each anime in the entry (title, image, type, episodes, genres) that My List, Home, and Stats work without calling the API.

Rules:

- `episodesWatched` stays between 0 and `totalEpisodes`. When the total is unknown, there is no upper limit.
- Setting the status to Completed sets `episodesWatched` to the total.
- Reaching the total sets the status to Completed.
- Every change updates `updatedAt`.

### Storage

Define one interface and one implementation:

```ts
interface ListStore {
  getAll(): Promise<ListEntry[]>;
  get(malId: number): Promise<ListEntry | null>;
  upsert(entry: ListEntry): Promise<void>;
  remove(malId: number): Promise<void>;
  exportJson(): Promise<string>;
  importJson(json: string): Promise<void>;
}
```

- Phase 1 implementation: `LocalStorageListStore`.
- Methods are async now so a database-backed version can replace it in phase 2 without changing any screen.
- Validate imported JSON before saving it.
- Handle `localStorage` being unavailable or full without crashing.

## Components

Build these once and reuse them everywhere:

- `Sidebar` and `MenuItem`
- `SkewButton` (variants: primary, outline, muted)
- `SkewTabs`
- `SearchBox`
- `ProgressBar` (watched, total)
- `PosterCard` (parallelogram) and `HeroPoster` (skewed)
- `Panel` (cut corner)
- `ListRow`
- `EpisodeStepper`
- `ScorePicker`
- `StatusSelect`
- `StatTile`
- `Skeleton` versions of the card, row, and hero
- `EmptyState` and `ErrorState`

## States every screen must handle

- **Loading:** skeletons in the shape of the final content, not spinners.
- **Empty:** a helpful message and one clear action.
- **Error:** what went wrong in plain words and a retry button.
- **Missing data:** no poster (show a `panel` block with the title), unknown episode count (show `EP x / ?` and a full-width track), no synopsis, no trailer.

## Accessibility

- Use real elements: `button`, `a`, `input` with `label`, `select`. No click handlers on `div` or `span`.
- Everything works with a keyboard, with a visible focus style in `accent`.
- Text contrast of at least 4.5:1 (3:1 for text 24px and larger).
- Icon-only buttons have an `aria-label`. Progress bars and charts have a text alternative.
- Tabs, the score picker, and the modal follow the standard ARIA patterns, including focus trapping in the modal.
- Skewed elements must not cause text to be clipped or overlap at any width.

## Quality bar

- TypeScript strict mode with no `any`.
- No layout shift when images load: reserve the poster space.
- Use `next/image` for posters, with the Jikan image host allowed in the Next.js config.
- Works at 360px, 768px, 1280px, and 1440px wide.
- Lighthouse accessibility score of 95 or higher.

## Done when

- [ ] All five screens match the mockups on desktop.
- [ ] An anime can be found, added, tracked to completion, scored, and removed.
- [ ] The list survives a page reload and can be exported and imported.
- [ ] Stats update as the list changes.
- [ ] Every screen has loading, empty, and error states.
- [ ] The app is fully usable with a keyboard and on a phone.
- [ ] The API rate limit is never exceeded in normal use.
- [ ] No component reads or writes `localStorage` directly.
