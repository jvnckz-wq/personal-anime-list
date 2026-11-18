"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Ransom } from "@/components/ui/ransom";
import { SearchField } from "@/components/ui/search-field";
import { EmptyState, Icon, SkewButton, Tabs } from "@/components/ui/primitives";
import { CardSkeletons, MetaList, PosterCard } from "@/components/ui/slots";
import { GENRES, browseAnime, errorMessage, searchAnime, type Browse } from "@/lib/anime-api";
import { useList } from "@/lib/store/list-context";
import { type AnimeSummary, STATUS_LABEL } from "@/lib/types";
import { DiscoverFilters, useDiscoverParams } from "./filters";

const BROWSE: { value: Browse; label: string }[] = [
  { value: "season", label: "This season" },
  { value: "top", label: "Top rated" },
  { value: "upcoming", label: "Upcoming" },
];

type Loaded = { loadKey: string; items: AnimeSummary[]; page: number; hasNext: boolean; error: string | null };

/** New game: browse or search the catalog and start new files. */
export function DiscoverScreen() {
  const { q, tab, genre, type, set } = useDiscoverParams();
  const { get, addFile } = useList();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const focusIndex = useRef<number | null>(null);

  /* The query bar: typing updates the URL after a pause; back/forward restore it. */
  const [text, setText] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    if (typeof document === "undefined" || document.activeElement?.id !== "q") setText(q);
  }
  const typeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Leaving New game cancels a pending search update: at the moment the owner opens a file or a menu
  // entry (before the URL changes), and again when the page is hidden.
  useLayoutEffect(() => () => clearTimeout(typeTimer.current), []);
  useEffect(() => {
    const cancel = () => clearTimeout(typeTimer.current);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("a[href], .slot")) cancel();
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (((e.key === "Enter" || e.key === " ") && t.closest?.(".slot")) || (/^[1-4]$/.test(e.key) && t.id !== "q")) cancel();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);
  const search = (v: string, now: boolean) => {
    clearTimeout(typeTimer.current);
    // A delayed update must never pull the owner back after they opened a file.
    const run = () => {
      if (window.location.pathname === "/discover") set({ q: v.trim() });
    };
    if (now) run();
    else typeTimer.current = setTimeout(run, 400);
  };

  const loadKey = JSON.stringify({ q, tab, type, genre, attempt });
  const [showFilters, setShowFilters] = useState(false);
  const loading = loaded?.loadKey !== loadKey;

  useEffect(() => {
    let alive = true;
    const run = q ? searchAnime(q, 1, { genreId: genre || undefined, type }) : browseAnime(tab, 1, type, genre);
    run
      .then((p) => alive && setLoaded({ loadKey, items: p.items, page: 1, hasNext: p.hasNext, error: null }))
      .catch((err) => alive && setLoaded({ loadKey, items: [], page: 1, hasNext: false, error: errorMessage(err) }));
    return () => {
      alive = false;
    };
    // loadKey captures every input of the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  useEffect(() => {
    if (focusIndex.current === null) return;
    const cards = document.querySelectorAll<HTMLElement>("#results .slot");
    cards[focusIndex.current]?.focus();
    focusIndex.current = null;
  });

  const loadMore = async () => {
    if (!loaded) return;
    setLoadingMore(true);
    try {
      const next = loaded.page + 1;
      const p = q ? await searchAnime(q, next, { genreId: genre || undefined, type }) : await browseAnime(tab, next, type, genre);
      const have = new Set(loaded.items.map((a) => a.malId));
      focusIndex.current = visible.length;
      setLoaded({ ...loaded, items: [...loaded.items, ...p.items.filter((a) => !have.has(a.malId))], page: next, hasNext: p.hasNext });
    } catch (err) {
      setLoaded({ ...loaded, error: errorMessage(err) });
    } finally {
      setLoadingMore(false);
    }
  };

  const genreName = GENRES.find((g) => g.id === genre)?.name;
  const items = loading || !loaded ? [] : loaded.items;
  const visible = items;
  const activeFilters = (genre ? 1 : 0) + (type ? 1 : 0);
  const tabLabel = BROWSE.find((b) => b.value === tab)?.label ?? "Top rated";

  let body: React.ReactNode;
  if (loading) {
    body = (
      <>
        <p className="sr-only" role="status">
          Loading anime
        </p>
        <CardSkeletons />
      </>
    );
  } else if (loaded?.error && !items.length) {
    body = (
      <EmptyState
        level={3}
        title={q ? "Couldn't search right now" : `Couldn't load ${tabLabel}`}
        text={loaded.error}
        actions={<SkewButton onClick={() => setAttempt((n) => n + 1)}>Try again</SkewButton>}
      />
    );
  } else if (!visible.length) {
    body = q ? (
      <EmptyState level={3} title={`No anime matches “${q}”`} text="Check the spelling, or search a shorter part of the title." actions={<SkewButton onClick={() => { setText(""); set({ q: "" }); }}>Clear search</SkewButton>} />
    ) : (
      <EmptyState
        level={3}
        title="Nothing matches these filters"
        text="Pick another genre or type."
        actions={
          <>
            <SkewButton variant="outline" onClick={() => set({ genre: "", type: "" })}>
              Reset filters
            </SkewButton>
          </>
        }
      />
    );
  } else {
    body = (
      <>
        <div className="cards">
          {visible.map((a) => {
            const file = get(a.malId);
            return (
              <PosterCard
                key={a.malId}
                malId={a.malId}
                title={a.title}
                imageUrl={a.imageUrl}
                label={`${a.title}, ${a.type}, ${a.episodes ?? "unknown"} episodes${file ? `, ${STATUS_LABEL[file.status]}` : ""}`}
                meta={<MetaList items={[a.type, `${a.episodes ?? "?"} ${a.episodes === 1 ? "ep" : "eps"}`]} />}
                action={
                  file ? (
                    <span className="status-tag">
                      <span>{STATUS_LABEL[file.status]}</span>
                    </span>
                  ) : (
                    <SkewButton small aria-label={`Save game: start watching ${a.title}`} onClick={() => addFile(a, "watching")}>
                      <Icon name="plus" />
                      Save game
                    </SkewButton>
                  )
                }
              />
            );
          })}
        </div>
        {loaded?.error ? <p className="notice">{loaded.error}</p> : null}
        {loaded?.hasNext ? (
          <div className="more">
            <SkewButton variant="outline" onClick={loadMore} disabled={loadingMore} aria-busy={loadingMore}>
              {loadingMore ? "Loading…" : "Load more"}
            </SkewButton>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <section className="screen" aria-labelledby="t-new">
      <h1 className="page-title" id="t-new" tabIndex={-1}>
        <Ransom text="New game" seed={16} />
      </h1>
      <SearchField
        id="q"
        label="Search all anime"
        placeholder="Search all anime"
        shortcut="/"
        className="query-bar"
        value={text}
        onChange={(v) => {
          setText(v);
          search(v, v === "");
        }}
        onSubmit={() => search(text, true)}
      />
      <div className="controls">
        {q ? (
          <div className="results-for">
            <p>
              Results for <b>“{q}”</b>
              {genreName || type ? ` in ${[genreName, type.toUpperCase()].filter(Boolean).join(", ")}` : ""}
            </p>
            <SkewButton variant="outline" small onClick={() => { setText(""); set({ q: "" }); }}>
              Clear search
            </SkewButton>
          </div>
        ) : (
          <Tabs label="Browse" idPrefix="browse" panelId="results" value={tab} onChange={(v) => set({ tab: v === "top" ? "" : v })} items={BROWSE} />
        )}
      </div>
      <SkewButton variant="outline" small className="filters-toggle" aria-expanded={showFilters} aria-controls="discover-filters" onClick={() => setShowFilters((v) => !v)}>
        {showFilters ? "Hide filters" : activeFilters ? `Filters (${activeFilters})` : "Filters"}
      </SkewButton>
      <DiscoverFilters open={showFilters} />
      <div id="results" role={q ? undefined : "tabpanel"} aria-labelledby={q ? undefined : `browse-${tab}`} aria-busy={loading}>
        <h2 className="sr-only">{q ? "Search results" : tabLabel}</h2>
        {body}
      </div>
    </section>
  );
}
