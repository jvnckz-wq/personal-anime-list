"use client";

import { useEffect, useRef } from "react";
import { EmptyState, SkewButton, SkewLink } from "@/components/ui/primitives";
import { SaveSlot, SlotRow } from "@/components/ui/slots";
import { shortTitle } from "@/lib/format";
import { useList } from "@/lib/store/list-context";
import { useSteadyOrder } from "../use-steady";

const bySaved = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt);

/** Continue: every file in progress is a save slot, the latest one large, each with one-tap +1. */
export function ContinueScreen() {
  const { ready, entries, clearingId, startFile } = useList();
  const inProgress = useSteadyOrder(
    "continue",
    entries.filter((e) => e.status === "watching" || e.malId === clearingId).sort(bySaved),
  );
  const plan = entries.filter((e) => e.status === "plan_to_watch").sort(bySaved);

  /* The cursor starts on the latest save slot, and that slot really has focus: Enter opens it. */
  const focused = useRef(false);
  useEffect(() => {
    if (!ready || focused.current) return;
    focused.current = true;
    if (document.activeElement === document.body) document.querySelector<HTMLElement>("main .slot.hero")?.focus({ preventScroll: true });
  }, [ready]);

  return (
    <section className="screen" aria-labelledby="t-continue">
      <h1 className="page-title" id="t-continue" tabIndex={-1}>
        Continue
      </h1>
      {!ready ? (
        <div className="screen" aria-hidden="true">
          <div className="skel-slot" />
          <div className="skel-row" />
        </div>
      ) : inProgress.length === 0 ? (
        plan.length ? (
          <EmptyState
            title="Nothing in progress"
            text={`${plan.length === 1 ? "One file is" : `${plan.length} files are`} waiting in Plan to watch. Start one and it becomes your save slot here.`}
            actions={
              <>
                <SkewButton onClick={() => startFile(plan[0].malId)}>Start {shortTitle(plan[0].title)}</SkewButton>
                <SkewLink href="/discover" variant="outline">
                  New game
                </SkewLink>
              </>
            }
          />
        ) : (
          <EmptyState
            title="Nothing in progress"
            text="Find a show in New game and start a file. Every show you start becomes a save file with its own number, and it waits here, ready to continue."
            actions={<SkewLink href="/discover">New game</SkewLink>}
          />
        )
      ) : (
        <div className="screen">
          <SaveSlot entry={inProgress[0]} clearing={inProgress[0].status === "completed"} />
          {inProgress.length > 1 ? (
            <section className="group" aria-labelledby="t-other">
              <h2 className="label" id="t-other">
                Also in progress
              </h2>
              <div className="rows">
                {inProgress.slice(1).map((e) => (
                  <SlotRow key={e.malId} entry={e} level={3} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
