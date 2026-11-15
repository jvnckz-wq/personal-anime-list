"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { useList } from "@/lib/store/list-context";
import type { ListEntry } from "@/lib/types";
import { STATUS_LABEL, STATUS_ORDER, type Status } from "@/lib/types";
import { Icon, MemoryBlocks, SkewButton } from "./primitives";

export function StatusSelect({ entry }: { entry: ListEntry }) {
  const { setStatus } = useList();
  return (
    <label className="field">
      <span className="small">Status</span>
      <select value={entry.status} onChange={(e) => setStatus(entry.malId, e.target.value as Status)}>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EpisodeStepper({ entry }: { entry: ListEntry }) {
  const { logEpisode } = useList();
  const id = useId();
  const full = entry.totalEpisodes !== null && entry.episodesWatched >= entry.totalEpisodes;
  return (
    <div className="field">
      <span className="small" id={id}>
        Episodes
      </span>
      <div className="stepper" role="group" aria-labelledby={id}>
        <button type="button" className="step" aria-label="Remove one episode" disabled={entry.episodesWatched <= 0} onClick={() => logEpisode(entry.malId, -1)}>
          <Icon name="minus" />
        </button>
        <output className="step-value" aria-live="polite">
          {entry.episodesWatched}
          <small> / {entry.totalEpisodes ?? "?"}</small>
        </output>
        <button type="button" className="step" aria-label={`Log episode ${entry.episodesWatched + 1}`} disabled={full} onClick={() => logEpisode(entry.malId, 1)}>
          <Icon name="plus" />
        </button>
      </div>
      <MemoryBlocks watched={entry.episodesWatched} total={entry.totalEpisodes} />
    </div>
  );
}

const SCORES: (number | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Score 1 to 10 as a native radio group, so arrow keys and screen readers work as expected. */
export function ScorePicker({ entry }: { entry: ListEntry }) {
  const { setScore } = useList();
  const name = useId();
  return (
    <fieldset className="field field--wide">
      <legend className="small">My score</legend>
      <div className="scores">
        {SCORES.map((n) => (
          <label key={n ?? 0}>
            <input
              type="radio"
              name={name}
              value={n ?? ""}
              checked={entry.score === n}
              aria-label={n ? `Score ${n}` : "No score"}
              onChange={() => setScore(entry.malId, n)}
            />
            <span>
              <b>{n ?? "–"}</b>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Native modal dialog: focus trap, Esc to close and focus return come from the browser. */
function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [onClose]);
  // A page hidden by navigation must not come back with its dialog open.
  useLayoutEffect(() => () => onClose(), [onClose]);
  return ref;
}

export function ConfirmDialog({ open, title, text, confirmLabel, onConfirm, onClose }: { open: boolean; title: string; text: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useModal(open, onClose);
  const id = useId();
  return (
    <dialog ref={ref} aria-labelledby={`${id}-t`} aria-describedby={`${id}-d`}>
      <h2 className="dialog-title" id={`${id}-t`}>
        {title}
      </h2>
      <p id={`${id}-d`} style={{ marginTop: 14 }}>
        {text}
      </p>
      <div className="dialog-actions">
        <SkewButton autoFocus onClick={() => ref.current?.close()}>
          No
        </SkewButton>
        <SkewButton
          variant="outline"
          onClick={() => {
            ref.current?.close();
            onConfirm();
          }}
        >
          {confirmLabel}
        </SkewButton>
      </div>
    </dialog>
  );
}

export function TrailerDialog({ open, url, title, onClose }: { open: boolean; url: string | null; title: string; onClose: () => void }) {
  const ref = useModal(open, onClose);
  const id = useId();
  return (
    <dialog ref={ref} aria-labelledby={id} id="dlg-trailer">
      <div className="dialog-head">
        <h2 className="dialog-title" id={id}>
          {title} trailer
        </h2>
        <button type="button" className="icon-btn" aria-label="Close trailer" onClick={() => ref.current?.close()}>
          <Icon name="close" />
        </button>
      </div>
      <div className={`trailer-frame${open && url ? " has-video" : ""}`}>
        {open && url ? <iframe src={url} title={`${title} trailer`} allow="encrypted-media; picture-in-picture; fullscreen" /> : null}
      </div>
    </dialog>
  );
}
