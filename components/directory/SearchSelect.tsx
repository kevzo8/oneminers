"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SelectOption<T extends string> = { value: T; label: string };

/** Compact searchable dropdown. Accepts plain strings or { value, label } options. */
export default function SearchSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "w-full",
  disabled = false,
  placeholder = "Find…",
}: {
  value: T;
  options: readonly (T | SelectOption<T>)[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = useMemo(
    () => options.map((option) => (typeof option === "string" ? { value: option as T, label: option } : option)),
    [options]
  );
  const current = normalized.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const term = filter.trim().toLowerCase();
  const matches = normalized.filter((option) => option.label.toLowerCase().includes(term) || option.value.toLowerCase().includes(term));

  function pick(next: T) {
    onChange(next);
    setOpen(false);
    setFilter("");
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((isOpen) => !isOpen);
          setFilter("");
        }}
        className="input flex w-full items-center justify-between gap-1 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
        aria-expanded={open}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.35rem)] z-30 w-56 max-w-[85vw] rounded-xl border border-line bg-surface-solid p-1.5 shadow-2xl">
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && matches[0]) pick(matches[0].value);
              }}
              placeholder={placeholder}
              className="input w-full py-1.5 text-xs"
              style={{ paddingLeft: "2rem" }}
              aria-label={`Search ${label}`}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {matches.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-muted hover:bg-panel-soft hover:text-ink"
              >
                <span className="truncate">{option.label}</span>
                {value === option.value ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
              </button>
            ))}
            {matches.length === 0 ? <p className="px-2.5 py-2 text-sm text-muted">No matches</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
