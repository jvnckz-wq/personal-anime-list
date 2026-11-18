"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MENU, useAppNav } from "@/components/shell/app-shell";
import { CutFrame } from "@/components/ui/cut-frame";
import { MemoryBlocks, Poster, SkewLink, Stamp } from "@/components/ui/primitives";
import { Ransom } from "@/components/ui/ransom";
import { LogButton, useSlotFlash } from "@/components/ui/slots";
import { ago, episodeText, pad, percent, playTime } from "@/lib/format";
import { useList } from "@/lib/store/list-context";
import type { ListEntry } from "@/lib/types";

const bySaved = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt);

/** The title screen: PAL's main menu, with the latest save one press away. */
export function TitleScreen() {
  const { ready, entries, clearingId } = useList();
  const { from } = useAppNav();
  const latest = entries.filter((e) => e.status === "watching" || e.malId === clearingId).sort(bySaved)[0];
  const start = Math.max(0, MENU.findIndex((m) => m.screen === from));
  const [on, setOn] = useState(start);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  /* On a fresh load the menu cursor really has focus, so Enter confirms straight away. */
  useEffect(() => {
    if (document.activeElement === document.body) refs.current[start]?.focus({ preventScroll: true });
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (i: number) => refs.current[(i + MENU.length) % MENU.length]?.focus();

  return (
    <section className="title-screen" aria-labelledby="t-title">
      <div className="t-left">
        <h1 className="t-logo" id="t-title" tabIndex={-1}>
          <Ransom text="PAL" seed={7} />
        </h1>
        <nav className="t-menu" aria-label="Main menu">
          <ul>
            {MENU.map((m, i) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className={`m-item${i === on ? " on" : ""}`}
                  style={{ "--d": i } as React.CSSProperties}
                  data-autofocus={i === start ? "" : undefined}
                  aria-keyshortcuts={String(i + 1)}
                  aria-describedby={`msub-${i}`}
                  onFocus={() => setOn(i)}
                  onMouseEnter={(e) => e.currentTarget.focus({ preventScroll: true })}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                    e.preventDefault();
                    move(i + (e.key === "ArrowDown" ? 1 : -1));
                  }}
                >
                  <span className="num" aria-hidden="true">
                    {m.n}
                  </span>
                  <span className="m-text">
                    <Ransom text={m.label} seed={i * 3 + 2} calm />
                    <span className="m-sub" id={`msub-${i}`}>
                      {m.sub}
                    </span>
                  </span>
                  <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M20 3L4 12l16 9z" />
                  </svg>
                  <CutFrame />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="t-right">
        <div className="t-cut" aria-hidden="true" />
        {!ready ? (
          <div className="t-art" aria-hidden="true" />
        ) : latest ? (
          <LatestSave entry={latest} />
        ) : (
          <>
            <div className="t-art" aria-hidden="true">
              <span className="poster-fallback">PAL</span>
            </div>
            <article className="slip" aria-labelledby="slip-t">
              <span className="slip-kicker">
                <span>No save in progress</span>
              </span>
              <h2 className="slip-title" id="slip-t">
                Start a file in New game
              </h2>
              <p className="slip-text">Save a game and it waits here, one press from the next episode.</p>
              <div className="actions">
                <SkewLink href="/discover">New game</SkewLink>
              </div>
            </article>
          </>
        )}
      </div>
    </section>
  );
}

function LatestSave({ entry }: { entry: ListEntry }) {
  const ref = useRef<HTMLElement>(null);
  useSlotFlash(ref, entry.malId);
  const p = percent(entry.episodesWatched, entry.totalEpisodes);
  return (
    <>
      <Poster src={entry.imageUrl} title={entry.title} className="t-art" sizes="60vw" />
      <div className="t-bignum" aria-hidden="true">
        {pad(entry.fileNo)}
      </div>
      <article
        ref={ref}
        className="slip"
        aria-labelledby="slip-t"
        data-id={entry.malId}
        data-loggable={entry.status === "watching" ? "" : undefined}
      >
        {entry.status === "completed" ? <Stamp /> : null}
        <div className="slip-top">
          <Poster src={entry.imageUrl} title={entry.title} className="slip-poster" sizes="92px" />
          <div className="slip-body">
            <span className="slip-kicker">
              <span>Latest save · File {pad(entry.fileNo)}</span>
            </span>
            <h2 className="slip-title" id="slip-t">
              {entry.title}
            </h2>
            <div className="ep-line">
              <span>{episodeText(entry.episodesWatched, entry.totalEpisodes)}</span>
              {p === null ? null : <b>{p}%</b>}
            </div>
            <dl className="slip-stats">
              <div>
                <dt>Play time</dt>
                <dd>{playTime(entry)}</dd>
              </div>
              <div>
                <dt>Saved</dt>
                <dd>{ago(entry.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <MemoryBlocks watched={entry.episodesWatched} total={entry.totalEpisodes} />
        <div className="actions">
          {entry.status === "watching" ? <LogButton entry={entry} large /> : null}
          <SkewLink href={`/anime/${entry.malId}`} variant="outline">
            Open file
          </SkewLink>
        </div>
      </article>
    </>
  );
}
