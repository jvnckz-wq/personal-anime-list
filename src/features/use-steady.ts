"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Keeps a list's order steady while the owner acts in it, so a row never jumps out from under the
 * cursor after +1. New items go first. The order resets when the key changes or the page is hidden.
 */
export function useSteadyOrder<T extends { malId: number }>(key: string, items: T[]): T[] {
  const [memo, setMemo] = useState<{ key: string; order: number[] } | null>(null);
  const prev = memo && memo.key === key ? memo.order : null;
  const sorted = prev ? [...items].sort((a, b) => prev.indexOf(a.malId) - prev.indexOf(b.malId)) : items;
  const order = sorted.map((i) => i.malId);
  if (!prev || order.join() !== prev.join()) setMemo({ key, order });
  // A page hidden by navigation comes back sorted fresh.
  useLayoutEffect(() => () => setMemo(null), []);
  return sorted;
}
