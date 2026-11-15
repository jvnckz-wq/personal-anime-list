"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GENRES, type TypeFilter } from "@/lib/anime-api";

/** New game query (search, tab, genre, type) lives in the URL, so back and forward restore it. */
export function useDiscoverParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `/discover?${qs}` : "/discover", { scroll: false });
  };
  return {
    onDiscover: pathname === "/discover",
    q: params.get("q") ?? "",
    tab: (params.get("tab") ?? "top") as "season" | "top" | "upcoming",
    genre: Number(params.get("genre") ?? 0),
    type: (params.get("type") ?? "") as TypeFilter,
    set,
  };
}

/** Genre and type, one row under the browse tabs on every screen size. */
export function DiscoverFilters({ open }: { open: boolean }) {
  const { genre, type, set } = useDiscoverParams();
  const labelId = "genre-label";
  const chips = [{ id: 0, name: "All" }, ...GENRES];
  return (
    <div id="discover-filters" className={`filters filters--main${open ? " is-open" : ""}`} role="group" aria-label="Filters">
      <div>
        <span className="small" id={labelId}>
          Genre
        </span>
        <div className="chips" role="group" aria-labelledby={labelId}>
          {chips.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={genre === g.id} onClick={() => set({ genre: g.id ? String(g.id) : "" })}>
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      </div>
      <label className="small">
        Type
        <select value={type} onChange={(e) => set({ type: e.target.value })}>
          <option value="">All types</option>
          <option value="tv">TV</option>
          <option value="movie">Movie</option>
          <option value="ova">OVA</option>
        </select>
      </label>
    </div>
  );
}
