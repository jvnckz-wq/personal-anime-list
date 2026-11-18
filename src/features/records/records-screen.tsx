"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/controls";
import { EmptyState, SkewButton, SkewLink } from "@/components/ui/primitives";
import { Ransom } from "@/components/ui/ransom";
import { PosterCard } from "@/components/ui/slots";
import { useList } from "@/lib/store/list-context";
import { STATUS_LABEL, STATUS_ORDER, type Status } from "@/lib/types";

/* Status chart segments on the ink panel: paper, hot red, grey, dark grey, each with a readable count. */
const SEGMENT: Record<Status, [string, string]> = {
  watching: ["var(--paper)", "var(--ink)"],
  completed: ["var(--red-hot)", "var(--ink)"],
  plan_to_watch: ["var(--ink-muted)", "var(--ink)"],
  dropped: ["var(--ink-3)", "var(--paper)"],
};

/** Player data: the play record, computed from the list alone. */
export function RecordsScreen() {
  const { ready, entries, backup, restore } = useList();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<File | null>(null);
  const closeRestore = useCallback(() => setPending(null), []);

  const dataBox = (
    <section className="group wide" aria-labelledby="t-data">
      <h2 className="label" id="t-data">
        Save data
      </h2>
      <div className="data-box">
        <p>Your files live in this browser only. Back up downloads them as a JSON file. Restore loads a backup and replaces what&apos;s here.</p>
        <div className="actions">
          <SkewButton variant="outline" small onClick={() => void backup()}>
            Back up
          </SkewButton>
          <SkewButton variant="outline" small onClick={() => fileInput.current?.click()}>
            Restore
          </SkewButton>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="visually-hidden-input"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPending(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </section>
  );

  let body: React.ReactNode;
  if (!ready) body = <div className="skel-slot" aria-hidden="true" />;
  else if (!entries.length)
    body = (
      <div className="records">
        <EmptyState title="No player data yet" text="Player data fills in as you save and clear games." actions={<SkewLink href="/discover">New game</SkewLink>} />
        {dataBox}
      </div>
    );
  else {
    const minutes = entries.reduce((s, e) => s + e.episodesWatched * e.durationMin, 0);
    const scored = entries.filter((e) => e.score);
    const mean = scored.length ? (scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length).toFixed(1) : "–";
    const counts = STATUS_ORDER.map((s) => [s, entries.filter((e) => e.status === s).length] as const);
    const cleared = entries.filter((e) => e.status === "completed");
    const genreCount = new Map<string, number>();
    entries.forEach((e) => e.genres.forEach((g) => genreCount.set(g, (genreCount.get(g) ?? 0) + 1)));
    const top = [...genreCount].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
    const scoreCounts = Array.from({ length: 10 }, (_, i) => entries.filter((e) => e.score === i + 1).length);
    body = (
      <div className="records">
        <section className="playtime" aria-labelledby="t-play">
          <h2 className="label" id="t-play">
            Total play time
          </h2>
          <p className="playtime-clock">
            {Math.floor(minutes / 60)}
            <small>h</small>
            {minutes % 60}
            <small>min</small>
          </p>
          <dl className="stats">
            <div>
              <dt>Files</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Clear rate</dt>
              <dd>{Math.round((cleared.length / entries.length) * 100)}%</dd>
            </div>
            <div>
              <dt>Mean score</dt>
              <dd>{mean}</dd>
            </div>
          </dl>
        </section>
        <div className="screen" style={{ gap: 40 }}>
          <section className="group" aria-labelledby="t-status">
            <h2 className="label" id="t-status">
              By status
            </h2>
            <div className="statbar" role="img" aria-label={counts.map(([s, n]) => `${STATUS_LABEL[s]} ${n}`).join(", ")}>
              {counts
                .filter(([, n]) => n)
                .map(([s, n]) => (
                  <i key={s} style={{ flex: n, background: SEGMENT[s][0], color: SEGMENT[s][1] }}>
                    <span>{n}</span>
                  </i>
                ))}
            </div>
            <ul className="legend">
              {counts.map(([s, n]) => (
                <li key={s}>
                  <i style={{ background: SEGMENT[s][0] }} aria-hidden="true" />
                  {STATUS_LABEL[s]} <b>{n}</b>
                </li>
              ))}
            </ul>
          </section>
          {top.length ? (
            <section className="group" aria-labelledby="t-genres">
              <h2 className="label" id="t-genres">
                Top genres
              </h2>
              <ul className="bars">
                {top.map(([g, n]) => (
                  <li key={g}>
                    <span>{g}</span>
                    <span className="bar" aria-hidden="true">
                      <i style={{ width: `${(n / top[0][1]) * 100}%` }} />
                    </span>
                    <b>{n}</b>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <section className="group wide" aria-labelledby="t-cleared">
          <h2 className="label" id="t-cleared">
            Cleared files
          </h2>
          {cleared.length ? (
            <div className="cards wall">
              {cleared.map((e) => (
                <PosterCard key={e.malId} malId={e.malId} title={e.title} imageUrl={e.imageUrl} stamped label={`${e.title}, cleared`} meta={<span className="meta-text">{e.score ? `Score ${e.score}` : "No score"}</span>} />
              ))}
            </div>
          ) : (
            <p className="meta-text">No cleared files yet. Log a show&apos;s last episode to stamp it.</p>
          )}
        </section>
        <section className="group wide" aria-labelledby="t-scores">
          <h2 className="label" id="t-scores">
            My scores
          </h2>
          <div className="score-chart" role="img" aria-label={`Scores given: ${scoreCounts.map((n, i) => `${i + 1}: ${n}`).join(", ")}`}>
            {scoreCounts.map((n, i) => (
              <div className="col" key={i}>
                {n ? <b>{n}</b> : null}
                {n ? Array.from({ length: n }, (_, j) => <i key={j} />) : <i className="zero" />}
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
        {dataBox}
      </div>
    );
  }

  return (
    <section className="screen" aria-labelledby="t-records">
      <h1 className="page-title" id="t-records" tabIndex={-1}>
        <Ransom text="Player data" seed={26} />
      </h1>
      {body}
      <ConfirmDialog
        open={!!pending}
        title="Replace your files?"
        text={`Restoring ${pending?.name ?? "this backup"} replaces all ${entries.length} files in this browser. You can undo right after.`}
        confirmLabel="Yes, restore"
        onConfirm={() => pending && void restore(pending)}
        onClose={closeRestore}
      />
    </section>
  );
}
