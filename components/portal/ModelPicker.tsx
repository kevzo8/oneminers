"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type PortalMiner = {
  slug: string;
  name: string;
  manufacturer: string;
  hashrate: string;
  powerW: number;
  efficiency: string;
  algorithm: string;
  cooling: string;
  release?: number;
  coins: string[];
  refPrice: number;
  market?: { min: number; max: number; median: number; count: number; condition: string; estimated: boolean };
};

const MAX_RESULTS = 60;

function matches(miner: PortalMiner, words: string[]) {
  const hay = `${miner.name} ${miner.hashrate} ${miner.algorithm} ${miner.coins.join(" ")} ${miner.slug}`.toLowerCase();
  return words.every((word) => hay.includes(word));
}

/** Searchable model selector: type a few letters ("s21 hyd", "ks5", "scrypt") and pick from the list. */
export default function ModelPicker({
  miners,
  value,
  onChange,
}: {
  miners: PortalMiner[];
  value: string;
  onChange: (miner: PortalMiner) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selected = miners.find((miner) => miner.slug === value);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = words.length ? miners.filter((miner) => matches(miner, words)) : miners;
    return { total: found.length, items: found.slice(0, MAX_RESULTS) };
  }, [miners, query]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    // The listings table scrolls horizontally, so the menu is fixed to the viewport and closes on scroll.
    const dismiss = (event: Event) => {
      if (!(event.target instanceof Node) || !box.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function pick(miner: PortalMiner) {
    onChange(miner);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={box} className="relative w-72">
      <button
        ref={button}
        type="button"
        onClick={() => {
          const rect = button.current?.getBoundingClientRect();
          if (rect) setPos({ top: rect.bottom + 4, left: Math.max(8, Math.min(rect.left, window.innerWidth - 428)) });
          setOpen((current) => !current);
          setActive(0);
        }}
        className="input flex w-full items-center justify-between gap-2 py-2 text-left text-xs"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Model"
      >
        <span className="truncate">{selected ? `${selected.name} · ${selected.hashrate}` : `${value} (not in catalog)`}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      {open ? (
        <div style={{ top: pos.top, left: pos.left }} className="fixed z-50 w-[420px] max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-line bg-surface-solid shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input
              ref={input}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((index) => Math.min(index + 1, results.items.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const miner = results.items[active];
                  if (miner) pick(miner);
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={`Search ${miners.length} models: brand, model, hashrate, coin…`}
              className="w-full bg-transparent py-2.5 text-xs text-ink outline-none placeholder:text-muted/70"
              role="combobox"
              aria-expanded="true"
              aria-controls="model-picker-list"
            />
          </div>
          <ul ref={list} id="model-picker-list" role="listbox" className="max-h-80 overflow-y-auto py-1">
            {results.items.map((miner, index) => (
              <li
                key={miner.slug}
                data-index={index}
                role="option"
                aria-selected={miner.slug === value}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(miner);
                }}
                className={`cursor-pointer px-3 py-2 ${index === active ? "bg-panel-soft" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`truncate text-xs font-semibold ${miner.slug === value ? "text-accent" : "text-ink"}`}>{miner.name}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted">
                    {miner.market ? `~$${miner.market.median.toLocaleString("en-US")}` : ""}
                  </span>
                </div>
                <div className="truncate text-[11px] text-muted">
                  {miner.hashrate} · {miner.powerW.toLocaleString("en-US")} W · {miner.efficiency} · {miner.algorithm}
                  {miner.coins.length ? ` · ${miner.coins.join(", ")}` : ""}
                </div>
              </li>
            ))}
            {results.total === 0 ? <li className="px-3 py-6 text-center text-xs text-muted">No model matches “{query}”.</li> : null}
          </ul>
          {results.total > MAX_RESULTS ? (
            <div className="border-t border-line px-3 py-1.5 text-[10px] text-muted">
              Showing {MAX_RESULTS} of {results.total}. Keep typing to narrow it down.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Spec summary shown under the picker as soon as a model is chosen. */
export function ModelSpecs({ miner, price, onUsePrice }: { miner: PortalMiner; price: string; onUsePrice: (price: number) => void }) {
  const median = miner.market?.median;
  return (
    <div className="mt-1.5 w-72 space-y-1 rounded-lg border border-line/70 bg-panel-soft px-2.5 py-2 text-[11px] text-muted">
      <div>
        <span className="font-semibold text-ink">{miner.hashrate}</span> · {miner.powerW.toLocaleString("en-US")} W · {miner.efficiency}
      </div>
      <div>
        {miner.algorithm} · {miner.cooling}
        {miner.release ? ` · ${miner.release}` : ""}
        {miner.coins.length ? ` · mines ${miner.coins.join(", ")}` : ""}
      </div>
      {miner.market ? (
        <div className="flex items-center justify-between gap-2">
          <span>
            Market ${miner.market.min.toLocaleString("en-US")}–${miner.market.max.toLocaleString("en-US")}
            {miner.market.estimated ? " (est.)" : ` · ${miner.market.count} offers`}
          </span>
          {median && String(median) !== price ? (
            <button type="button" onClick={() => onUsePrice(median)} className="shrink-0 font-semibold text-aqua hover:text-accent">
              Use ${median.toLocaleString("en-US")}
            </button>
          ) : null}
        </div>
      ) : (
        <div>No market price on record yet.</div>
      )}
    </div>
  );
}
