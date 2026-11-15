"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppNav } from "@/components/shell/app-shell";
import { ConfirmDialog, EpisodeStepper, ScorePicker, StatusSelect, TrailerDialog } from "@/components/ui/controls";
import { EmptyState, Icon, Poster, SkewButton, Stamp } from "@/components/ui/primitives";
import { CardSkeletons, MetaList, PosterCard, useSlotFlash } from "@/components/ui/slots";
import { ago, pad, playTime, shortTitle } from "@/lib/format";
import { errorMessage, getAnime, getCharacters, getRecommendations } from "@/lib/anime-api";
import { useList } from "@/lib/store/list-context";
import type { AnimeDetail, AnimeSummary, Character, ListEntry } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

type Remote = { id: number; detail: AnimeDetail | null; error: string | null; characters: Character[]; recs: AnimeSummary[] };

/** File details: what the anime is, and the one place where a file is edited. */
export function DetailsScreen() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { get, addFile, deleteFile } = useList();
  const { back } = useAppNav();
  const entry = get(id);
  const [remote, setRemote] = useState<Remote | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [askDelete, setAskDelete] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const closeDelete = useCallback(() => setAskDelete(false), []);
  const closeTrailer = useCallback(() => setTrailer(false), []);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let alive = true;
    getAnime(id)
      .then((detail) => {
        if (!alive) return;
        setRemote({ id, detail, error: null, characters: [], recs: [] });
        // Secondary sections load after the main record and simply stay hidden if they fail.
        getCharacters(id).then((characters) => alive && setRemote((r) => (r && r.id === id ? { ...r, characters } : r))).catch(() => {});
        getRecommendations(id).then((recs) => alive && setRemote((r) => (r && r.id === id ? { ...r, recs } : r))).catch(() => {});
      })
      .catch((err) => alive && setRemote({ id, detail: null, error: errorMessage(err), characters: [], recs: [] }));
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [id]);

  const current = remote && remote.id === id ? remote : null;
  const detail = current?.detail ?? null;
  const loading = !current;
  const title = detail?.title ?? entry?.title ?? "";
  const summary: AnimeSummary | null = detail ?? (entry ? { malId: entry.malId, title: entry.title, imageUrl: entry.imageUrl, type: entry.type, episodes: entry.totalEpisodes, durationMin: entry.durationMin, genres: entry.genres } : null);

  if (!summary) {
    return (
      <section className="screen" aria-label="File details">
        <div className="back">
          <SkewButton variant="outline" small onClick={back} aria-keyshortcuts="Escape">
            <Icon name="back" />
            Back
          </SkewButton>
        </div>
        {loading ? (
          <div className="skel-slot" aria-hidden="true" />
        ) : (
          <EmptyState title="Couldn't load this anime" text={current?.error ?? ""} actions={<SkewButton onClick={() => setAttempt((n) => n + 1)}>Try again</SkewButton>} />
        )}
      </section>
    );
  }

  const meta = [summary.type, `${summary.episodes ?? "?"} ${summary.episodes === 1 ? "episode" : "episodes"}`];
  if (detail?.season || detail?.year) meta.push([detail.season ? detail.season[0].toUpperCase() + detail.season.slice(1) : "", detail.year ?? ""].join(" ").trim());
  if (detail?.studios.length) meta.push(detail.studios[0]);

  return (
    <section className="screen" aria-label={`${title} details`}>
      <div className="back">
        <SkewButton variant="outline" small onClick={back} aria-keyshortcuts="Escape">
          <Icon name="back" />
          Back
        </SkewButton>
      </div>
      <div className="detail-grid">
        <Poster src={summary.imageUrl} title={title} className="detail-poster" sizes="(max-width: 1023px) 104px, 240px" />
        <div className="detail-head">
          <h1 className="detail-title" tabIndex={-1} ref={titleRef}>
            {title}
          </h1>
          <MetaList items={meta} />
          {summary.genres.length ? (
            <ul className="tags" aria-label="Genres">
              {summary.genres.map((g) => (
                <li className="tag" key={g}>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <SavePanel entry={entry} summary={summary} onNew={(status) => addFile(summary, status)} onDelete={() => setAskDelete(true)} />
      </div>

      {current?.error && !detail ? <p className="notice">{current.error} Your file is still here and editable.</p> : null}

      {detail?.synopsis || detail?.trailerEmbedUrl ? (
        <section className="group about" aria-labelledby="t-about">
          <h2 className="label" id="t-about">
            About
          </h2>
          {detail.synopsis ? <p>{detail.synopsis}</p> : null}
          {detail.trailerEmbedUrl ? (
            <SkewButton variant="outline" small onClick={() => setTrailer(true)}>
              <Icon name="play" />
              Watch trailer
            </SkewButton>
          ) : null}
        </section>
      ) : loading ? (
        <CardSkeletons count={0} />
      ) : null}

      {current?.characters.length ? (
        <section className="group" aria-labelledby="t-chars">
          <h2 className="label" id="t-chars">
            Characters
          </h2>
          <ul className="chars">
            {current.characters.map((c) => (
              <li className="char" key={c.id}>
                <Poster src={c.imageUrl} title={c.name} className="char-portrait" sizes="160px" />
                <span className="char-name">{c.name}</span>
                <span className="meta-text">{c.role}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {current?.recs.length ? (
        <section className="group" aria-labelledby="t-recs">
          <h2 className="label" id="t-recs">
            You might also like
          </h2>
          <div className="cards">
            {current.recs.map((r) => {
              const f = get(r.malId);
              return (
                <PosterCard
                  key={r.malId}
                  malId={r.malId}
                  title={r.title}
                  imageUrl={r.imageUrl}
                  stamped={f?.status === "completed"}
                  label={`${r.title}${f ? `, ${STATUS_LABEL[f.status]}` : ""}`}
                  meta={f ? <span className="meta-text">{STATUS_LABEL[f.status]}</span> : null}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={askDelete && !!entry}
        title={entry ? `Delete file ${pad(entry.fileNo)}?` : "Delete file?"}
        text={`${title}, its progress and its score will be removed from this browser.`}
        confirmLabel="Yes, delete"
        onConfirm={() => {
          if (!entry) return;
          deleteFile(entry.malId);
          back();
        }}
        onClose={closeDelete}
      />
      <TrailerDialog open={trailer} url={detail?.trailerEmbedUrl ?? null} title={shortTitle(title)} onClose={closeTrailer} />
    </section>
  );
}

function SavePanel({ entry, summary, onNew, onDelete }: { entry: ListEntry | undefined; summary: AnimeSummary; onNew: (s: "watching" | "plan_to_watch") => void; onDelete: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useSlotFlash(ref, summary.malId);
  if (!entry) {
    return (
      <section className="panel" aria-labelledby="track-t" ref={ref}>
        <div className="panel-head">
          <h2 className="label" id="track-t">
            Save data
          </h2>
        </div>
        <p>Not a file yet. Start it now and it goes straight to Continue, or keep it for later.</p>
        <div className="actions">
          <SkewButton onClick={() => onNew("watching")}>
            <Icon name="plus" />
            New file
          </SkewButton>
          <SkewButton variant="outline" onClick={() => onNew("plan_to_watch")}>
            Plan to watch
          </SkewButton>
        </div>
      </section>
    );
  }
  return (
    <section className="panel" aria-labelledby="track-t" ref={ref}>
      {entry.status === "completed" ? <Stamp /> : null}
      <div className="panel-head">
        <div className="file-no">
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
        <h2 className="sr-only" id="track-t">
          Save data
        </h2>
      </div>
      <div className="fields">
        <StatusSelect entry={entry} />
        <EpisodeStepper entry={entry} />
        <ScorePicker entry={entry} />
      </div>
      <div className="panel-foot">
        <SkewButton variant="muted" small onClick={onDelete}>
          Delete file
        </SkewButton>
      </div>
    </section>
  );
}
