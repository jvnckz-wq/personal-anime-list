import type { ListEntry } from "../types";
import { type ListStore, StoreError, parseList } from "./list-store";

const KEY = "pal:list:v1";

/** Phase 1 store: the list lives in this browser. The only file that touches localStorage. */
export class LocalStorageListStore implements ListStore {
  /** Fallback copy when localStorage is blocked, so the session still works. */
  private memory: ListEntry[] = [];

  private read(): ListEntry[] {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return this.memory;
      return parseList(JSON.parse(raw)) ?? this.memory;
    } catch {
      return this.memory;
    }
  }

  private write(list: ListEntry[]) {
    this.memory = list;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ version: 1, entries: list }));
    } catch {
      throw new StoreError("Couldn't save to this browser. Storage may be full or blocked.");
    }
  }

  async getAll() {
    return this.read();
  }

  async get(malId: number) {
    return this.read().find((e) => e.malId === malId) ?? null;
  }

  async upsert(entry: ListEntry) {
    const list = this.read();
    const i = list.findIndex((e) => e.malId === entry.malId);
    this.write(i < 0 ? [...list, entry] : list.map((e, j) => (j === i ? entry : e)));
  }

  async remove(malId: number) {
    this.write(this.read().filter((e) => e.malId !== malId));
  }

  async exportJson() {
    return JSON.stringify({ app: "pal", version: 1, exportedAt: new Date().toISOString(), entries: this.read() }, null, 2);
  }

  async importJson(json: string) {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new StoreError("That file isn't a PAL backup. Nothing was changed.");
    }
    const list = parseList(data);
    if (!list) throw new StoreError("That file isn't a PAL backup. Nothing was changed.");
    this.write(list);
  }
}

/** Fires when another tab changes the list. */
export function onExternalChange(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
