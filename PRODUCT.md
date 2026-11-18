# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally. When their needs conflict, neither wins by default; the design has to serve both.

- **The owner, daily.** A person who watches anime and wants to keep track of it: what they are watching, which episode they are on, what they finished, and how they scored it. They open PAL often, usually to log an episode or pick up where they left off.
- **Portfolio reviewers.** Recruiters and reviewers looking at PAL as a portfolio project for a UI/UX designer and frontend developer. They judge visual craft, interaction quality, and accessibility, often in a few minutes and on desktop.

## Product Purpose

PAL is a personal anime watchlist. People search and browse anime, add titles to their list, track episode progress, score what they watch, and see stats about their viewing.

Success means the owner can find, add, track to completion, score and remove an anime without friction, the list survives reloads and can be backed up, and a reviewer comes away convinced of the builder's design and frontend skill.

## Positioning

- **A game-menu experience.** Using PAL feels like moving through a JRPG menu, not filling in a database form. This is the core difference from MyAnimeList and AniList.
- **Personal, not social.** The list belongs to one person. No public profiles, reviews, comments, forums or feeds.

## Operating Context

- Used in the browser, on desktop and on phone. No install, no account in phase 1; the app is usable immediately.
- The owner returns repeatedly for short sessions: log an episode, continue a show, check what is next.
- Reviewers arrive from a portfolio link and explore briefly.

## Capabilities and Constraints

**Phase 1 (current scope)**

- Anime data comes from the AniList GraphQL API (`https://graphql.anilist.co`), with the Jikan API (`https://api.jikan.moe/v4`) as a fallback. Both are free, need no key and are read-only. AniList allows up to 90 requests a minute and Jikan 3 a second and 60 a minute; PAL stays well under both. Every anime keeps its MyAnimeList id, so both sources and saved files agree.
- The list is stored in the browser (`localStorage`) and can be exported and imported as JSON as a safeguard.
- All list reads and writes go through one storage interface (`ListStore`) so a database can replace browser storage later without changing screens.
- A title screen (home: the main menu plus the latest save, one press from logging the next episode) and five screens: Continue, New game (discover/search), Load game (my list), file details (anime detail), Player data (stats).
- Statuses: watching, completed (cleared), plan to watch, dropped. Scores 1 to 10. Episode count stays within the known total; reaching the total completes the show.

**Phase 2 (planned, not built)**

- Accounts via Google sign-in, with the list stored in PostgreSQL through Prisma.

**Out of scope**

- Social features, comments, public profiles; manga; streaming or links to streaming sites; notifications.

**Stack (existing):** Next.js (App Router), React, TypeScript in strict mode, Tailwind CSS; deploy target Vercel. shadcn/ui is planned for behaviour-heavy components.

**Terminology:** the interface uses save-file language: Continue, New game, Load game, Player data, Save game (start a show), file numbers, Cleared, Delete file, Back up / Restore.

**Language:** the interface is in English.

## Brand Commitments

- **Name:** PAL (renamed from the working name "Pila").
- **Concept:** a game menu. The owner has confirmed this twice; future redesigns stay within a game-menu concept.

## Evidence on Hand

- No logo, illustrations, screenshots, testimonials or user data exist yet.
- Anime titles, posters, synopses and characters come from AniList (or Jikan) at runtime; sample titles in mockups are placeholders.
- Planning notes live in the private Obsidian vault at `personal-anilist/PAL/` (gitignored). Exploratory mockups are in `mockups/`.
- Do not fabricate usage numbers, reviews, users or press.

## Product Principles

1. **Daily use and showcase are equal.** Every flourish must still let the owner log an episode in one action; every shortcut must still look crafted.
2. **The game menu is the experience, not a skin.** Navigation, wording and feedback behave like a game menu (selection, confirmation, clearing a file), not just look like one.
3. **The list is private and portable.** One person's data, held on their device, always exportable; nothing social creeps in.
4. **Works without an account today, ready for one tomorrow.** Storage stays behind one interface.
5. **Clarity wins over style** when the two conflict.

## Accessibility & Inclusion

- Fully usable with a keyboard, with a visible focus indicator.
- Text contrast at least 4.5:1 (3:1 for text 24px and larger).
- Progress bars and charts carry text alternatives; tabs, score picker and dialogs follow standard ARIA patterns.
- `prefers-reduced-motion` turns motion into simple fades.
- Works at 360px, 768px, 1280px and 1440px; touch targets at least 44px.
- Target Lighthouse accessibility score of 95 or higher.
