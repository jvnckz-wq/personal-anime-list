"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { initials } from "@/lib/format";

/** Restart a CSS animation class on an element. */
export function retrigger(el: Element | null | undefined, cls: string) {
  if (!el) return;
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  play: <path d="M8 5l11 7-11 7z" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
};

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg className={name === "play" ? "ic ic--fill" : "ic"} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}

type Variant = "primary" | "outline" | "muted";
const skewClass = (variant: Variant, small?: boolean) => `skew skew--${variant}${small ? " skew--sm" : ""}`;

export function SkewButton({ variant = "primary", small, children, className, ...rest }: ComponentProps<"button"> & { variant?: Variant; small?: boolean }) {
  return (
    <button type="button" className={`${skewClass(variant, small)}${className ? ` ${className}` : ""}`} {...rest}>
      <span>{children}</span>
    </button>
  );
}

export function SkewLink({ variant = "primary", small, children, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; small?: boolean }) {
  return (
    <Link className={skewClass(variant, small)} {...rest}>
      <span>{children}</span>
    </Link>
  );
}

/** Progress as memory blocks: one per episode up to 26 (two cours), two segments above that, a plain track when the total is unknown. */
export function MemoryBlocks({ watched, total }: { watched: number; total: number | null }) {
  const label = total ? `${watched} of ${total} episodes watched` : `${watched} episodes watched, total unknown`;
  let cells: ReactNode;
  if (total && total <= 26) cells = Array.from({ length: total }, (_, i) => <i key={i} className={i < watched ? "on" : undefined} />);
  else if (total)
    cells = (
      <>
        <i className="on" style={{ flex: watched }} />
        <i style={{ flex: total - watched }} />
      </>
    );
  else cells = <i />;
  return (
    <div className="blocks" role="img" aria-label={label}>
      {cells}
    </div>
  );
}

export function Stamp() {
  return <span className="stamp">CLEAR</span>;
}

/** Poster art from Jikan, with initials when there is no image or it fails to load. */
export function Poster({ src, title, className, sizes, children }: { src: string | null; title: string; className: string; sizes: string; children?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className} aria-hidden="true">
      {src && !failed ? (
        <Image src={src} alt="" fill sizes={sizes} className="poster-img" unoptimized onError={() => setFailed(true)} />
      ) : (
        <span className="poster-fallback">{initials(title)}</span>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ title, text, actions, level = 2 }: { title: string; text: string; actions?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className="empty">
      <H>{title}</H>
      <p>{text}</p>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

/** ARIA tabs with roving focus: arrows move and select, Home and End jump. */
export function Tabs<T extends string>({
  label,
  items,
  value,
  onChange,
  idPrefix,
  panelId,
}: {
  label: string;
  items: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  idPrefix: string;
  panelId: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = items.length - 1;
    const n = e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (n < 0) return;
    e.preventDefault();
    onChange(items[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((it, i) => (
        <button
          key={it.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`${idPrefix}-${it.value}`}
          aria-controls={panelId}
          aria-selected={it.value === value}
          tabIndex={it.value === value ? 0 : -1}
          onClick={() => onChange(it.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
