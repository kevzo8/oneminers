"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type MultiOption<T extends string> = { value: T; label: string; count?: number };

export default function MultiSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  allLabel,
  className = "w-full",
  placeholder = "Find…",
}: {
  value: T[];
  options: readonly (T | MultiOption<T>)[];
  onChange: (value: T[]) => void;
  label: string;
  allLabel?: string;
  className?: string;
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
  const base = allLabel ?? label;
  const selectedLabel =
    value.length === 0 ? base : value.length === 1 ? (normalized.find((option) => option.value === value[0])?.label ?? value[0]) : `${base} (${value.length})`;

  function toggle(next: T) {
    onChange(value.includes(next) ? value.filter((item) => item !== next) : [...value, next]);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setFilter("");
        }}
        className="input flex w-full items-center justify-between gap-1 py-1.5 text-xs"
        aria-label={label}
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.35rem)] z-30 w-64 max-w-[85vw] rounded-xl border border-line bg-surface-solid p-1.5 shadow-2xl">
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && matches[0]) toggle(matches[0].value);
              }}
              placeholder={placeholder}
              className="input w-full py-1.5 text-xs"
              style={{ paddingLeft: "2rem" }}
              aria-label={`Search ${label}`}
            />
          </div>
          <div className="mb-1 flex items-center justify-between border-b border-line/60 px-1 pb-1.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-muted hover:text-ink"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onChange(matches.map((option) => option.value))}
              className="text-aqua hover:text-accent"
            >
              Select shown
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {matches.map((option) => {
              const checked = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted hover:bg-panel-soft hover:text-ink"
                >
                  <span
                    className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border ${
                      checked ? "border-accent bg-accent" : "border-line"
                    }`}
                    aria-hidden="true"
                  >
                    {checked ? <Check className="h-2.5 w-2.5 text-on-accent" /> : null}
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.count != null ? <span className="shrink-0 text-[10px] tabular-nums text-muted/70">{option.count}</span> : null}
                </button>
              );
            })}
            {matches.length === 0 ? <p className="px-2 py-2 text-[11px] text-muted">No matches</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
