"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useToast } from "@/components/shell/toast";
import { pad, shortTitle } from "../format";
import type { AnimeSummary, ListEntry, Status } from "../types";
import { STATUS_LABEL } from "../types";
import { StoreError } from "./list-store";
import { LocalStorageListStore, onExternalChange } from "./local-storage-list-store";

/** What just happened to a file, so its slot can answer with motion. */
export type ListEvent = { id: number; kind: "log" | "clear"; seq: number };

type ListApi = {
  ready: boolean;
  entries: ListEntry[];
  get: (malId: number) => ListEntry | undefined;
  event: ListEvent | null;
  /** A file that was just cleared stays in place for a moment so its stamp can land. */
  clearingId: number | null;
  logEpisode: (malId: number, delta?: number) => void;
  setStatus: (malId: number, status: Status) => void;
  setScore: (malId: number, score: number | null) => void;
  addFile: (anime: AnimeSummary, status: "watching" | "plan_to_watch") => void;
  startFile: (malId: number) => void;
  deleteFile: (malId: number) => void;
  backup: () => Promise<void>;
  restore: (file: File) => Promise<void>;
  undo: () => boolean;
};

const ListContext = createContext<ListApi | null>(null);

const noSubscribe = () => () => {};

export function useList(): ListApi {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error("useList must be used inside ListProvider");
  // While a component hydrates it must match the server HTML, which never has the list.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (hydrated) return ctx;
  return { ...ctx, ready: false, entries: [], get: () => undefined };
}

const replace = (list: ListEntry[], next: ListEntry) => list.map((e) => (e.malId === next.malId ? next : e));

export function ListProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [store] = useState(() => new LocalStorageListStore());
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [event, setEvent] = useState<ListEvent | null>(null);
  const [clearingId, setClearingId] = useState<number | null>(null);
  const current = useRef<ListEntry[]>([]);
  const seq = useRef(0);
  const lastSave = useRef(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const apply = useCallback((list: ListEntry[]) => {
    current.current = list;
    setEntries(list);
    setReady(true);
  }, []);

  const load = useCallback(async () => apply(await store.getAll()), [store, apply]);

  useEffect(() => {
    let alive = true;
    const reload = () => store.getAll().then((list) => alive && apply(list));
    void reload();
    const off = onExternalChange(() => void reload());
    return () => {
      alive = false;
      off();
    };
  }, [store, apply]);

  /** Save times always move forward, so the latest save is never tied. */
  const now = () => {
    lastSave.current = Math.max(Date.now(), lastSave.current + 1);
    return new Date(lastSave.current).toISOString();
  };

  const persist = useCallback(
    async (prev: ListEntry[], next: ListEntry[]) => {
      try {
        const before = new Map(prev.map((e) => [e.malId, e]));
        for (const e of next) if (before.get(e.malId) !== e) await store.upsert(e);
        const after = new Set(next.map((e) => e.malId));
        for (const e of prev) if (!after.has(e.malId)) await store.remove(e.malId);
      } catch (err) {
        toast.show(err instanceof StoreError ? err.message : "Couldn't save that change.");
      }
    },
    [store, toast],
  );

  /** Every write: apply, save, and offer undo from the toast. */
  const commit = useCallback(
    (message: string, compute: (list: ListEntry[]) => ListEntry[], ev?: Omit<ListEvent, "seq">) => {
      const prev = current.current;
      const next = compute(prev);
      current.current = next;
      setEntries(next);
      void persist(prev, next);
      if (ev) setEvent({ ...ev, seq: ++seq.current });
      toast.show(message, {
        onUndo: () => {
          const undone = current.current;
          current.current = prev;
          setEntries(prev);
          setClearingId(null);
          void persist(undone, prev);
          toast.show("Undone");
        },
      });
    },
    [persist, toast],
  );

  const find = (id: number) => current.current.find((e) => e.malId === id);

  const logEpisode = useCallback(
    (id: number, delta = 1) => {
      const e = find(id);
      if (!e) return;
      const w = e.episodesWatched + delta;
      if (w < 0 || (e.totalEpisodes !== null && w > e.totalEpisodes)) return;
      const clears = e.totalEpisodes !== null && w === e.totalEpisodes;
      let status: Status = e.status;
      if (clears) status = "completed";
      else if (status === "completed" || (delta > 0 && status === "plan_to_watch")) status = "watching";
      const name = shortTitle(e.title);
      const message = clears ? `${name} cleared. File ${pad(e.fileNo)} stamped.` : delta > 0 ? `${name}: episode ${w} logged` : `${name}: back to episode ${w}`;
      commit(message, (list) => replace(list, { ...e, episodesWatched: w, status, updatedAt: now() }), { id, kind: clears ? "clear" : "log" });
      if (clears) {
        setClearingId(id);
        clearTimeout(clearTimer.current);
        clearTimer.current = setTimeout(() => setClearingId(null), 1600);
      }
    },
    [commit],
  );

  const setStatus = useCallback(
    (id: number, status: Status) => {
      const e = find(id);
      if (!e) return;
      let watched = e.episodesWatched;
      let note = "";
      const total = e.totalEpisodes;
      if (status === "completed" && total !== null && watched < total) {
        watched = total;
        note = `, all ${total} episodes logged`;
      }
      if (status === "watching" && total !== null && watched >= total) {
        watched = Math.max(0, total - 1);
        note = `, set to episode ${watched} of ${total}`;
      }
      commit(
        `${shortTitle(e.title)} moved to ${STATUS_LABEL[status]}${note}`,
        (list) => replace(list, { ...e, status, episodesWatched: watched, updatedAt: now() }),
        status === "completed" ? { id, kind: "clear" } : undefined,
      );
    },
    [commit],
  );

  const setScore = useCallback(
    (id: number, score: number | null) => {
      const e = find(id);
      if (!e) return;
      commit(score ? `${shortTitle(e.title)}: score ${score} saved` : `${shortTitle(e.title)}: score removed`, (list) =>
        replace(list, { ...e, score, updatedAt: now() }),
      );
    },
    [commit],
  );

  const addFile = useCallback(
    (a: AnimeSummary, status: "watching" | "plan_to_watch") => {
      if (find(a.malId)) return;
      const fileNo = current.current.reduce((m, e) => Math.max(m, e.fileNo), 0) + 1;
      const stamp = now();
      const entry: ListEntry = {
        malId: a.malId,
        fileNo,
        title: a.title,
        imageUrl: a.imageUrl,
        type: a.type,
        totalEpisodes: a.episodes,
        durationMin: a.durationMin,
        genres: a.genres,
        status,
        episodesWatched: 0,
        score: null,
        addedAt: stamp,
        updatedAt: stamp,
      };
      const name = shortTitle(a.title);
      commit(status === "watching" ? `Game saved to File ${pad(fileNo)}: ${name}, ready on Continue` : `${name} saved to Plan to watch`, (list) => [...list, entry]);
    },
    [commit],
  );

  const startFile = useCallback(
    (id: number) => {
      const e = find(id);
      if (!e) return;
      commit(`${shortTitle(e.title)} moved to Watching`, (list) => replace(list, { ...e, status: "watching", updatedAt: now() }));
    },
    [commit],
  );

  const deleteFile = useCallback(
    (id: number) => {
      const e = find(id);
      if (!e) return;
      commit(`File ${pad(e.fileNo)} deleted: ${shortTitle(e.title)}`, (list) => list.filter((x) => x.malId !== id));
    },
    [commit],
  );

  const backup = useCallback(async () => {
    const json = await store.exportJson();
    const name = `pal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.show(`Backup downloaded: ${name}`);
  }, [store, toast]);

  const restore = useCallback(
    async (file: File) => {
      try {
        const before = current.current;
        await store.importJson(await file.text());
        await load();
        toast.show(`Restored ${current.current.length} files from ${file.name}`, {
          onUndo: () => {
            void store
              .importJson(JSON.stringify({ version: 1, entries: before }))
              .then(load)
              .then(() => toast.show("Restore undone"));
          },
        });
      } catch (err) {
        toast.show(err instanceof StoreError ? err.message : "Couldn't read that file. Nothing was changed.");
      }
    },
    [store, load, toast],
  );

  const value = useMemo<ListApi>(
    () => ({
      ready,
      entries,
      get: (id) => entries.find((e) => e.malId === id),
      event,
      clearingId,
      logEpisode,
      setStatus,
      setScore,
      addFile,
      startFile,
      deleteFile,
      backup,
      restore,
      undo: toast.undo,
    }),
    [ready, entries, event, clearingId, logEpisode, setStatus, setScore, addFile, startFile, deleteFile, backup, restore, toast.undo],
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}
