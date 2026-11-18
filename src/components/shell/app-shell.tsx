"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ListProvider, useList } from "@/lib/store/list-context";
import { retrigger } from "../ui/primitives";
import { ToastProvider } from "./toast";

export const MENU = [
  { href: "/continue", screen: "continue", n: "01", label: "Continue", sub: "Pick up your latest save" },
  { href: "/discover", screen: "new", n: "02", label: "New game", sub: "Search and browse every anime" },
  { href: "/list", screen: "files", n: "03", label: "Load game", sub: "Every file on your list" },
  { href: "/stats", screen: "records", n: "04", label: "Player data", sub: "Play time, clears and scores" },
] as const;

export type Screen = "title" | "continue" | "new" | "files" | "detail" | "records";
const screenOf = (p: string): Screen =>
  p === "/"
    ? "title"
    : p.startsWith("/continue")
      ? "continue"
      : p.startsWith("/discover")
        ? "new"
        : p.startsWith("/list")
          ? "files"
          : p.startsWith("/anime")
            ? "detail"
            : p.startsWith("/stats")
              ? "records"
              : "title";

/** First visible match: Next keeps visited routes in the DOM, hidden. */
const visible = <T extends HTMLElement>(selector: string) =>
  [...document.querySelectorAll<T>(selector)].find((el) => el.offsetParent !== null) ?? null;

const NavContext = createContext<{ back: () => void; from: Screen | null }>({ back: () => {}, from: null });
/** Back that stays inside PAL, and the section the owner last came from. */
export const useAppNav = () => useContext(NavContext);

const ICONS: Record<string, React.ReactNode> = {
  continue: <path d="M7 4l12 8-12 8z" />,
  new: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  files: <path d="M4 6h16M4 12h16M4 18h16" />,
  records: <path d="M5 20V11M12 20V4M19 20v-6" />,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ListProvider>
        {/* The route (pathname) is only known at request time on /anime/[id], so the shell streams in. */}
        <Suspense
          fallback={
            <header className="topstrip">
              <span className="strip-tag strip-tag--ink">
                <span>PAL // Save select</span>
              </span>
            </header>
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
  const [from, setFrom] = useState<Screen | null>(null);
  const [lastSection, setLastSection] = useState<Screen | null>(null);
  if (screen !== "detail" && screen !== "title" && lastSection !== screen) setLastSection(screen);
  if (screen !== "detail" && from !== screen) setFrom(screen);
  const wrapRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
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
    /* Hovering a slot (hero, row or poster card) selects it, so hover and the arrow keys share one cursor
       and one look. Never while typing: the search box keeps its focus. */
    const select = (e: Event) => {
      const card = (e.target as HTMLElement).closest?.("main .slot") as HTMLElement | null;
      const active = document.activeElement as HTMLElement | null;
      if (!card || card === active || card.contains(active)) return;
      if (active && (active.tagName === "INPUT" || active.tagName === "SELECT" || active.tagName === "TEXTAREA")) return;
      card.focus({ preventScroll: true });
    };
    document.addEventListener("click", remember, true);
    document.addEventListener("mouseover", select);
    return () => {
      document.removeEventListener("click", remember, true);
      document.removeEventListener("mouseover", select);
    };
  }, []);

  /* Screen change: a red and ink wipe crosses the page, the new screen appears behind it, focus lands on a slot. */
  useEffect(() => {
    if (moves.current === 0 && pathname === firstPath.current) return;
    moves.current += 1;
    retrigger(wipeRef.current, "run");
    retrigger(wrapRef.current, "enter");
    window.scrollTo(0, 0);
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
        if (active && active !== document.body && active.offsetParent !== null && !active.closest(".topstrip")) return;
        const id = lastSlot.current[pathname];
        const target = visible("main [data-autofocus]") || (id && visible(`main .slot[data-id="${id}"]`)) || visible("main .slot") || visible("main h1");
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
      const here = screenOf(window.location.pathname);
      if (e.key === "Escape") {
        if (typing) t.blur();
        else if (here === "detail") {
          e.preventDefault();
          back();
        } else if (here !== "title") {
          e.preventDefault();
          router.push("/");
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
        // On the title screen, + logs the latest save, wherever the menu cursor is.
        if ((e.key === "+" || e.key === "=") && here === "title") {
          const latest = visible<HTMLElement>("main .slip[data-loggable]");
          if (latest?.dataset.id) {
            e.preventDefault();
            logEpisode(Number(latest.dataset.id));
          }
          return;
        }
        // With nothing selected, an arrow key picks the first slot (or the menu on the title screen).
        if (e.key.startsWith("Arrow") && (t === document.body || t.tagName === "H1" || t.tagName === "MAIN")) {
          const first = visible("main [data-autofocus]") || visible("main .slot");
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
    <NavContext.Provider value={{ back, from: lastSection }}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="topstrip">
        <Link href="/" className="strip-tag strip-tag--ink home-link" title="Back to the title screen">
          <span>PAL // Save select</span>
        </Link>
        {screen === "title" ? null : <Menu active={menuOn} />}
        <span className="strip-tag strip-tag--paper count-tag">
          <span>
            Local save · {entries.length} {entries.length === 1 ? "file" : "files"}
          </span>
        </span>
      </header>
      <main id="main" tabIndex={-1}>
        <div ref={wrapRef} className="screen-wrap">
          {children}
        </div>
      </main>
      <Guide screen={screen} canLog={canLog} />
      <div id="wipe" ref={wipeRef} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </NavContext.Provider>
  );
}

/** Section menu in the top strip (a bottom bar on phone). The title screen draws the big one. */
function Menu({ active }: { active: Screen | null }) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
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
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {ICONS[m.screen]}
            </svg>
            <span>
              <span className="n">{m.n}</span>
              {m.label}
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}

function Guide({ screen, canLog }: { screen: Screen; canLog: boolean }) {
  const keys: [string, string][] =
    screen === "title"
      ? [
          ["↑ ↓", "Select"],
          ["Enter", "Confirm"],
          ...(canLog ? ([["+", "Log episode"]] as [string, string][]) : []),
          ["1–4", "Jump"],
        ]
      : [
          ["Arrows", "Move"],
          ["Enter", "Open"],
          ...((screen === "continue" || screen === "files" || screen === "detail") && canLog ? ([["+", "Log episode"]] as [string, string][]) : []),
          ["/", "Search"],
          ["Esc", "Back"],
        ];
  return (
    <footer className="guide">
      <ul aria-label="Keyboard controls">
        {keys.map(([k, l]) => (
          <li key={k}>
            <kbd>{k}</kbd>
            <span>{l}</span>
          </li>
        ))}
      </ul>
      <Clock />
    </footer>
  );
}

/** The in-game clock at the corner of the menu. Client-only, so the server HTML never disagrees. */
function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setNow(`${pad(d.getHours())}:${pad(d.getMinutes())} · ${d.toLocaleDateString("en", { weekday: "short" })}`);
    };
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="clock" aria-hidden="true">
      {now}
    </span>
  );
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
