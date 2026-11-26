"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Term } from "@/lib/glossary";

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function letterOf(term: string) {
  const first = term[0].toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export default function Glossary({ terms }: { terms: Term[] }) {
  const [letter, setLetter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const present = useMemo(() => new Set(terms.map((t) => letterOf(t.term))), [terms]);
  const visible = terms
    .filter((t) => !letter || letterOf(t.term) === letter)
    .filter((t) => !query || `${t.term} ${t.definition}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-4">
      <div className="surface space-y-3 rounded-2xl p-4">
        <label className="relative block sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search terms…" className="input" style={{ paddingLeft: "2.25rem" }} aria-label="Search glossary" />
        </label>
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setLetter(null)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${letter === null ? "bg-aqua/15 text-aqua" : "text-muted hover:text-ink"}`}>
            All
          </button>
          {LETTERS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={!present.has(value)}
              onClick={() => setLetter(value)}
              className={`w-8 rounded-lg py-1 text-xs font-semibold disabled:opacity-25 ${letter === value ? "bg-aqua/15 text-aqua" : "text-muted hover:text-ink"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <dl className="grid gap-3 md:grid-cols-2">
        {visible.map((t) => (
          <div key={t.term} id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="surface rounded-2xl p-4">
            <dt className="text-sm font-bold text-ink">{t.term}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-muted">{t.definition}</dd>
          </div>
        ))}
      </dl>
      {visible.length === 0 ? <p className="py-10 text-center text-sm text-muted">No terms match.</p> : null}
    </div>
  );
}
