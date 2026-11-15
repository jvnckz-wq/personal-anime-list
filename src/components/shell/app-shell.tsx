"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type RefObject, Suspense, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ListProvider, useList } from "@/lib/store/list-context";
import { retrigger } from "../ui/primitives";
import { ToastProvider } from "./toast";

const MENU = [
  { href: "/", screen: "continue", n: "01", label: "CONTINUE" },
  { href: "/discover", screen: "new", n: "02", label: "NEW GAME" },
  { href: "/list", screen: "files", n: "03", label: "LOAD GAME" },
  { href: "/stats", screen: "records", n: "04", label: "PLAYER DATA" },
] as const;

type Screen = "continue" | "new" | "files" | "detail" | "records";
const screenOf = (p: string): Screen =>
  p === "/" ? "continue" : p.startsWith("/discover") ? "new" : p.startsWith("/list") ? "files" : p.startsWith("/anime") ? "detail" : p.startsWith("/stats") ? "records" : "continue";

/** First visible match: Next keeps visited routes in the DOM, hidden. */
const visible = <T extends HTMLElement>(selector: string) =>
  [...document.querySelectorAll<T>(selector)].find((el) => el.offsetParent !== null) ?? null;

const NavContext = createContext<{ back: () => void }>({ back: () => {} });
/** Back that stays inside PAL: history back after an in-app move, Continue otherwise. */
export const useAppNav = () => useContext(NavContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ListProvider>
        {/* The route (pathname) is only known at request time on /anime/[id], so the shell streams in. */}
        <Suspense
          fallback={
            <div className="shell">
              <div className="side">
                <span className="logo">
                  PAL<span>.</span>
                </span>
              </div>
              <main />
            </div>
          }
        >
          <Shell>{children}</Shell>
        </Suspense>
      </ListProvider>
    </ToastProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logEpisode, undo, entries } = useList();
  const screen = screenOf(pathname);
  const [from, setFrom] = useState<Screen | null>(screen === "detail" ? null : screen);
  if (screen !== "detail" && from !== screen) setFrom(screen);
  const mainRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const moves = useRef(0);
  const firstPath = useRef(pathname);
  const pendingSearch = useRef(false);
  /** The slot last opened on each screen, so coming back puts the cursor where you left it. */
  const lastSlot = useRef<Record<string, string>>({});

  useEffect(() => {
    document.body.dataset.screen = screen;
  }, [screen]);

  /* Remember which slot opened a file, whether by click or Enter. */
  useEffect(() => {
    const remember = (e: Event) => {
      const slot = (e.target as HTMLElement).closest?.("main .slot") as HTMLElement | null;
      if (slot?.dataset.id) lastSlot.current[window.location.pathname] = slot.dataset.id;
    };
    document.addEventListener("click", remember, true);
    return () => document.removeEventListener("click", remember, true);
  }, []);

  /* Screen change: speed lines streak across, the new screen arrives, and the cursor lands on a slot. */
  useEffect(() => {
    if (moves.current === 0 && pathname === firstPath.current) return;
    moves.current += 1;
    retrigger(mainRef.current, "sweep");
    retrigger(wrapRef.current, "enter");
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (pendingSearch.current && pathname === "/discover") {
          pendingSearch.current = false;
          let tries = 0;
          const focusSearch = () => {
            const q = visible("#q");
            if (q) q.focus();
            else if (tries++ < 20) setTimeout(focusSearch, 50);
          };
          focusSearch();
          return;
        }
        const active = document.activeElement as HTMLElement | null;
        // A screen that placed focus itself (details focuses its title) keeps it.
        if (active && active !== document.body && active.offsetParent !== null && !active.closest(".side")) return;
        const id = lastSlot.current[pathname];
        const target = (id && visible(`main .slot[data-id="${id}"]`)) || visible("main .slot") || visible("main h1");
        target?.focus({ preventScroll: true });
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const back = useCallback(() => {
    if (moves.current > 0) router.back();
    else router.push("/");
  }, [router]);

  /* Game-menu keys: arrows move, Enter opens, Esc backs out, 1-4 jump, / searches, + logs, U undoes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (document.querySelector("dialog[open]")) return;
      const typing = (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "radio") || t.tagName === "SELECT" || t.tagName === "TEXTAREA";
      if (e.key === "Escape") {
        if (typing) t.blur();
        else if (window.location.pathname.startsWith("/anime/")) {
          e.preventDefault();
          back();
        }
        return;
      }
      if (!typing && ((e.key === "z" && (e.ctrlKey || e.metaKey)) || (e.key === "u" && !e.ctrlKey && !e.metaKey))) {
        if (undo()) e.preventDefault();
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) {
        e.preventDefault();
        router.push(MENU[Number(e.key) - 1].href);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        if (window.location.pathname === "/discover") visible("#q")?.focus();
        else {
          pendingSearch.current = true;
          router.push("/discover");
        }
        return;
      }
      const slot = t.closest?.("main .slot") as HTMLElement | null;
      if (!slot) {
        // With nothing selected, an arrow key picks the first slot.
        if (e.key.startsWith("Arrow") && (t === document.body || t.tagName === "H1" || t.tagName === "MAIN")) {
          const first = visible("main .slot");
          if (first) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }
      if ((e.key === "+" || e.key === "=") && slot.dataset.loggable !== undefined) {
        e.preventDefault();
        logEpisode(Number(slot.dataset.id));
        return;
      }
      if (t !== slot) return;
      const dir = ({ ArrowRight: "right", ArrowLeft: "left", ArrowDown: "down", ArrowUp: "up" } as const)[e.key as "ArrowRight"];
      if (dir) {
        e.preventDefault();
        moveFocus(slot, dir);
      } else if ((e.key === "Enter" || e.key === " ") && slot.dataset.href) {
        e.preventDefault();
        if (slot.dataset.id) lastSlot.current[window.location.pathname] = slot.dataset.id;
        router.push(slot.dataset.href);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, back, undo, logEpisode]);

  const menuOn = screen === "detail" ? from : screen;
  const canLog = entries.some((e) => e.status === "watching");

  return (
    <NavContext.Provider value={{ back }}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="shell">
        <div className="side">
          <Link href="/" className="logo" aria-label="PAL, go to Continue">
            PAL<span>.</span>
          </Link>
          <Menu active={menuOn} />
          <Guide screen={screen} canLog={canLog} />
        </div>
        <main ref={mainRef} id="main" tabIndex={-1}>
          <SlotCursor mainRef={mainRef} />
          <div ref={wrapRef} className="screen-wrap">
            {children}
          </div>
        </main>
      </div>
    </NavContext.Provider>
  );
}

function Menu({ active }: { active: Screen | null }) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (!e.key.startsWith("Arrow")) return;
    e.preventDefault();
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    refs.current[(i + step + MENU.length) % MENU.length]?.focus();
  };
  return (
    <nav className="menu" aria-label="Main menu">
      {MENU.map((m, i) => (
        <Link
          key={m.href}
          href={m.href}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="menu-item"
          aria-current={active === m.screen ? "page" : undefined}
          aria-keyshortcuts={String(i + 1)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          <span>
            <span className="n">{m.n} </span>
            {m.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

function Guide({ screen, canLog }: { screen: Screen; canLog: boolean }) {
  const keys: [string, string][] = [
    ["Arrows", "Move"],
    ["Enter", "Open"],
  ];
  if (screen === "detail") keys.push(["Esc", "Back"]);
  if ((screen === "continue" || screen === "files") && canLog) keys.push(["+", "Log episode"]);
  keys.push(["1–4", "Menu"], ["/", "Search"]);
  return (
    <ul className="guide" aria-label="Keyboard controls">
      {keys.map(([k, l]) => (
        <li key={k}>
          <kbd>{k}</kbd>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

/** Bracket cursor: sits on the focused slot (keyboard or click), never follows hover. */
function SlotCursor({ mainRef }: { mainRef: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let last: Element | null = null;
    const place = () => {
      const cur = ref.current;
      const main = mainRef.current;
      if (!cur || !main) return;
      const active = document.activeElement;
      const slot = active instanceof Element ? (active.closest("main .slot") as HTMLElement | null) : null;
      document.querySelectorAll(".slot.is-cursor").forEach((s) => s !== slot && s.classList.remove("is-cursor"));
      if (!slot || !slot.offsetParent) {
        cur.style.opacity = "0";
        last = null;
        return;
      }
      slot.classList.add("is-cursor");
      // Brackets sit on the shape you see: a card frames its poster, and every bracket
      // follows the real (slanted) corner of the clip-path rather than the bounding box.
      const target = (slot.querySelector(".card-poster") as HTMLElement | null) ?? slot;
      const a = target.getBoundingClientRect();
      const b = main.getBoundingClientRect();
      const pts = shapeCorners(target, a.width, a.height);
      const gap = 8;
      const size = 26;
      const xs = [pts.tl[0] - gap, pts.bl[0] - gap, pts.tr[0] + gap, pts.br[0] + gap];
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      cur.style.width = `${maxX - minX}px`;
      cur.style.height = `${a.height + gap * 2}px`;
      cur.style.transform = `translate(${a.left - b.left + minX}px, ${a.top - b.top - gap}px)`;
      const [tl, tr, bl, br] = Array.from(cur.children) as HTMLElement[];
      const put = (el: HTMLElement, x: number, y: number) => {
        el.style.left = `${x - minX}px`;
        el.style.top = `${y + gap}px`;
        el.style.right = "auto";
        el.style.bottom = "auto";
      };
      put(tl, pts.tl[0] - gap, pts.tl[1] - gap);
      put(tr, pts.tr[0] + gap - size, pts.tr[1] - gap);
      put(bl, pts.bl[0] - gap, pts.bl[1] + gap - size);
      put(br, pts.br[0] + gap - size, pts.br[1] + gap - size);
      cur.style.opacity = "1";
      if (slot !== last) {
        retrigger(cur, "snap");
        retrigger(slot, "land");
      }
      last = slot;
    };
    const later = () => setTimeout(place);
    // Panels are dealt in with a short slide; re-measure once they land so brackets sit on the final spot.
    const settle = (e: AnimationEvent) => {
      if (e.animationName === "deal" || e.animationName === "cutIn") place();
    };
    document.addEventListener("focusin", place);
    document.addEventListener("focusout", later);
    document.addEventListener("animationend", settle);
    window.addEventListener("resize", place);
    const ro = new ResizeObserver(place);
    if (mainRef.current) ro.observe(mainRef.current);
    return () => {
      document.removeEventListener("focusin", place);
      document.removeEventListener("focusout", later);
      document.removeEventListener("animationend", settle);
      window.removeEventListener("resize", place);
      ro.disconnect();
    };
  }, [mainRef]);
  return (
    <div id="cursor" ref={ref} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

type Pt = [number, number];

/** One clip-path length ("12%", "26px", "calc(100% - 26px)") in px along an axis of `size`. */
function length(token: string, size: number) {
  const calc = /calc\(\s*100%\s*-\s*([\d.]+)px\s*\)/.exec(token);
  if (calc) return size - Number(calc[1]);
  if (token.endsWith("%")) return (Number.parseFloat(token) / 100) * size;
  return Number.parseFloat(token) || 0;
}

/** The four visible corners of an element's polygon clip-path (its box corners when it has none). */
function shapeCorners(el: HTMLElement, w: number, h: number): { tl: Pt; tr: Pt; bl: Pt; br: Pt } {
  const box = { tl: [0, 0] as Pt, tr: [w, 0] as Pt, bl: [0, h] as Pt, br: [w, h] as Pt };
  const clip = getComputedStyle(el).clipPath;
  const inner = /^polygon\((.*)\)$/.exec(clip ?? "")?.[1];
  if (!inner) return box;
  const points: Pt[] = inner.split(/,(?![^(]*\))/).map((pair) => {
    const parts = pair.trim().match(/calc\([^)]*\)|[^\s]+/g) ?? ["0", "0"];
    return [length(parts[0], w), length(parts[1] ?? "0", h)];
  });
  const nearest = (c: Pt) => points.reduce((best, p) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(best[0] - c[0], best[1] - c[1]) ? p : best), points[0]);
  return { tl: nearest(box.tl), tr: nearest(box.tr), bl: nearest(box.bl), br: nearest(box.br) };
}

/** Spatial move to the nearest visible slot in a direction. */
function moveFocus(from: HTMLElement, dir: "right" | "left" | "down" | "up") {
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  document.querySelectorAll<HTMLElement>("main .slot").forEach((s) => {
    if (s === from || !s.offsetParent || s.classList.contains("skel")) return;
    const b = s.getBoundingClientRect();
    const dx = b.left + b.width / 2 - ax;
    const dy = b.top + b.height / 2 - ay;
    const [main, cross] = { right: [dx, dy], left: [-dx, dy], down: [dy, dx], up: [-dy, dx] }[dir];
    if (main <= 8) return;
    const score = main + Math.abs(cross) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  });
  const target = best as HTMLElement | null;
  if (target) {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest" });
  }
}
