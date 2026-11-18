"use client";

import { useState } from "react";
import { EmptyState, SkewButton, SkewLink, Tabs } from "@/components/ui/primitives";
import { Ransom } from "@/components/ui/ransom";
import { SearchField } from "@/components/ui/search-field";
import { SlotRow } from "@/components/ui/slots";
import { percent } from "@/lib/format";
import { useList } from "@/lib/store/list-context";
import { type ListEntry, STATUS_LABEL, STATUS_ORDER, type Status } from "@/lib/types";
import { useSteadyOrder } from "../use-steady";

type Sort = "recent" | "no" | "title" | "progress" | "score";

const SORTS: Record<Sort, (a: ListEntry, b: ListEntry) => number> = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  no: (a, b) => a.fileNo - b.fileNo,
  title: (a, b) => a.title.localeCompare(b.title),
  progress: (a, b) => (percent(b.episodesWatched, b.totalEpisodes) ?? -1) - (percent(a.episodesWatched, a.totalEpisodes) ?? -1),
  score: (a, b) => (b.score ?? 0) - (a.score ?? 0),
};

const EMPTY: Record<Status, { title: string; text: string; action?: { href: string; label: string } }> = {
  watching: { title: "Nothing in progress", text: "Save a game from New game, or start one from Plan to watch.", action: { href: "/discover", label: "New game" } },
  completed: { title: "No cleared files yet", text: "Log a show's last episode and its file gets stamped CLEAR here.", action: { href: "/continue", label: "Continue" } },
  plan_to_watch: { title: "Nothing saved for later", text: "Open any anime in New game and choose Plan to watch.", action: { href: "/discover", label: "New game" } },
  dropped: { title: "No dropped files", text: "Files you stop watching land here. Change a file's status on its details page." },
};

/** Load game: every saved game, by status. Editing happens on each file's details page. */
export function FilesScreen() {
  const { ready, entries, clearingId } = useList();
  const [tab, setTab] = useState<Status>("watching");
  const [sort, setSort] = useState<Sort>("recent");
  const [find, setFind] = useState("");
  const needle = find.trim().toLowerCase();
  const rows = useSteadyOrder(
    `${tab}-${sort}`,
    entries.filter((e) => (e.status === tab || e.malId === clearingId) && (!needle || e.title.toLowerCase().includes(needle))).sort(SORTS[sort]),
  );
  const empty = EMPTY[tab];
  return (
    <section className="screen" aria-labelledby="t-files">
      <h1 className="page-title" id="t-files" tabIndex={-1}>
        <Ransom text="Load game" seed={21} />
      </h1>
      <div className="controls">
        <Tabs
          label="File status"
          idPrefix="tab"
          panelId="files-body"
          value={tab}
          onChange={setTab}
          items={STATUS_ORDER.map((s) => ({
            value: s,
            label: (
              <>
                {STATUS_LABEL[s]}
                <span className="count">
                  <span className="sr-only">, </span>
                  {entries.filter((e) => e.status === s).length}
                </span>
              </>
            ),
          }))}
        />
        <div className="controls-row">
          <SearchField id="find" label="Find a file" placeholder="Find a file" small value={find} onChange={setFind} />
        <label className="sort small">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recent">Last saved</option>
            <option value="no">File number</option>
            <option value="title">Title</option>
            <option value="progress">Progress</option>
            <option value="score">My score</option>
          </select>
        </label>
        </div>
      </div>
      <div className="rows" id="files-body" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {!ready ? (
          <div className="skel-row" aria-hidden="true" />
        ) : !rows.length && needle ? (
          <EmptyState title={`No file matches “${find.trim()}”`} text={`Nothing in ${STATUS_LABEL[tab]} has that in its title.`} actions={<SkewButton onClick={() => setFind("")}>Clear</SkewButton>} />
        ) : rows.length ? (
          rows.map((e) => <SlotRow key={e.malId} entry={e} level={2} />)
        ) : (
          <EmptyState title={empty.title} text={empty.text} actions={empty.action ? <SkewLink href={empty.action.href}>{empty.action.label}</SkewLink> : undefined} />
        )}
      </div>
    </section>
  );
}
