"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { ago, episodeText, pad, percent, playTime, slotLabel } from "@/lib/format";
import { useList } from "@/lib/store/list-context";
import type { ListEntry } from "@/lib/types";
import { CutFrame } from "./cut-frame";
import { MemoryBlocks, Poster, SkewButton, Stamp, retrigger } from "./primitives";

/** Answers the last change to this file: a hit for +1, the flood and stamp for CLEAR. */
export function useSlotFlash(ref: RefObject<HTMLElement | null>, malId: number) {
  const { event } = useList();
  useEffect(() => {
    const el = ref.current;
    if (!event || event.id !== malId || !el) return;
    const on = el.querySelectorAll(".blocks i.on");
    retrigger(on[on.length - 1], "new");
    el.querySelectorAll(".ep-line span:first-child, .row-ep span:first-child, .step-value").forEach((t) => retrigger(t, "tick"));
    retrigger(el, "hit");
    if (event.kind === "clear") {
      retrigger(el, "clear-flash");
      retrigger(el.querySelector(".stamp"), "is-new");
    }
    // Only a new event should replay the motion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.seq]);
}

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export function LogButton({ entry, large }: { entry: ListEntry; large?: boolean }) {
  const { logEpisode } = useList();
  const next = entry.episodesWatched + 1;
  return (
    <SkewButton
      small={!large}
      data-log=""
      aria-label={large ? `Watched EP ${next}, ${entry.title}` : `+1 EP, ${entry.title}`}
      onClick={(e) => {
        stop(e);
        logEpisode(entry.malId);
      }}
    >
      {large ? `Watched EP ${next}` : "+1 EP"}
    </SkewButton>
  );
}

/** The large save slot at the top of Continue. */
export function SaveSlot({ entry, clearing }: { entry: ListEntry; clearing: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  useSlotFlash(ref, entry.malId);
  const href = `/anime/${entry.malId}`;
  const p = percent(entry.episodesWatched, entry.totalEpisodes);
  return (
    <article
      ref={ref}
      className={`slot hero${clearing ? " is-clearing" : ""}`}
      tabIndex={0}
      data-id={entry.malId}
      data-href={href}
      data-loggable={entry.status === "watching" ? "" : undefined}
      aria-label={`${slotLabel(entry)}, last saved ${ago(entry.updatedAt).toLowerCase()}`}
      onClick={() => router.push(href)}
    >
      {entry.status === "completed" ? <Stamp /> : null}
      <Poster src={entry.imageUrl} title={entry.title} className="hero-poster" sizes="200px" />
      <div className="hero-body">
        <div className="hero-top">
          <div className="file-no" aria-hidden="true">
            <small>File</small>
            {pad(entry.fileNo)}
          </div>
          <dl className="stats">
            <div>
              <dt>Play time</dt>
              <dd>{playTime(entry)}</dd>
            </div>
            <div>
              <dt>Last saved</dt>
              <dd>{ago(entry.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <h2 className="hero-title">{entry.title}</h2>
        <div className="ep-line">
          <span>{episodeText(entry.episodesWatched, entry.totalEpisodes)}</span>
          {p === null ? null : <b>{p}%</b>}
        </div>
        <MemoryBlocks watched={entry.episodesWatched} total={entry.totalEpisodes} />
        <div className="actions">
          {entry.status === "watching" ? <LogButton entry={entry} large /> : null}
          <SkewButton
            variant="outline"
            onClick={(e) => {
              stop(e);
              router.push(href);
            }}
          >
            Open file
          </SkewButton>
        </div>
      </div>
      <CutFrame />
    </article>
  );
}

/** A file as a row: Continue's other slots and every row in Files. */
export function SlotRow({ entry, level = 3 }: { entry: ListEntry; level?: 2 | 3 }) {
  const router = useRouter();
  const { startFile } = useList();
  const ref = useRef<HTMLElement>(null);
  useSlotFlash(ref, entry.malId);
  const href = `/anime/${entry.malId}`;
  const H = level === 2 ? "h2" : "h3";
  const right =
    entry.status === "completed" || !entry.totalEpisodes
      ? entry.score
        ? `Score ${entry.score}`
        : "No score"
      : `${percent(entry.episodesWatched, entry.totalEpisodes)}%`;
  return (
    <article
      ref={ref}
      className="slot row"
      tabIndex={0}
      data-id={entry.malId}
      data-href={href}
      data-loggable={entry.status === "watching" ? "" : undefined}
      aria-label={slotLabel(entry)}
      onClick={() => router.push(href)}
    >
      {entry.status === "completed" ? <Stamp /> : null}
      <div className="num" aria-hidden="true">
        {pad(entry.fileNo)}
      </div>
      <Poster src={entry.imageUrl} title={entry.title} className="row-poster" sizes="70px" />
      <div className="row-body">
        <span className="row-no small" aria-hidden="true">
          File {pad(entry.fileNo)}
        </span>
        <H className="row-title">{entry.title}</H>
        <div className="row-ep meta-text">
          <span>{episodeText(entry.episodesWatched, entry.totalEpisodes)}</span>
          <span>{right}</span>
        </div>
        <MemoryBlocks watched={entry.episodesWatched} total={entry.totalEpisodes} />
      </div>
      <div className="row-act">
        {entry.status === "watching" ? <LogButton entry={entry} /> : null}
        {entry.status === "plan_to_watch" ? (
          <SkewButton
            variant="muted"
            small
            aria-label={`Start watching ${entry.title}`}
            onClick={(e) => {
              stop(e);
              startFile(entry.malId);
            }}
          >
            Start
          </SkewButton>
        ) : null}
      </div>
      <CutFrame />
    </article>
  );
}

/** Parallelogram poster card: New game results, recommendations, the cleared wall. */
export function PosterCard({
  malId,
  title,
  imageUrl,
  meta,
  action,
  stamped,
  label,
}: {
  malId: number;
  title: string;
  imageUrl: string | null;
  meta: ReactNode;
  action?: ReactNode;
  stamped?: boolean;
  label: string;
}) {
  const router = useRouter();
  const href = `/anime/${malId}`;
  return (
    <article className="slot card" tabIndex={0} data-id={malId} data-href={href} aria-label={label} onClick={() => router.push(href)}>
      <Poster src={imageUrl} title={title} className="card-poster" sizes="(max-width: 1023px) 45vw, 200px">
        {stamped ? <Stamp /> : null}
      </Poster>
      <h3 className="card-title">{title}</h3>
      {meta}
      {action ? (
        <div className="card-act" onClick={stop}>
          {action}
        </div>
      ) : null}
    </article>
  );
}

export function MetaList({ items }: { items: (string | number)[] }) {
  return (
    <ul className="meta meta-text">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function CardSkeletons({ count = 8 }: { count?: number }) {
  return (
    <div className="cards" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="card skel" key={i}>
          <div className="card-poster" />
          <div className="skel-line" />
          <div className="skel-line short" />
        </div>
      ))}
    </div>
  );
}
