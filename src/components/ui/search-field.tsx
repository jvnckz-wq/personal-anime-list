"use client";

import { Icon } from "./primitives";

/** Skewed search field. Esc clears it first, then leaves it. */
export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  small,
  shortcut,
  className = "",
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  small?: boolean;
  shortcut?: string;
  className?: string;
}) {
  return (
    <form
      className={`top-search${small ? " top-search--sm" : ""} ${className}`.trim()}
      role="search"
      aria-label={label}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Icon name="search" />
      <input
        type="search"
        id={id}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        aria-keyshortcuts={shortcut}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.stopPropagation();
          if (value) onChange("");
          else e.currentTarget.blur();
        }}
      />
      {shortcut ? <kbd aria-hidden="true">{shortcut}</kbd> : null}
    </form>
  );
}
