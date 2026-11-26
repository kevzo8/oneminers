"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "om.watchlist.v1";
const EVENT = "om-watchlist";

function read(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 200) : [];
  } catch {
    return [];
  }
}

/** Starred miners, saved in this browser (no account needed). */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(read());
    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [list, toggle] as const;
}
