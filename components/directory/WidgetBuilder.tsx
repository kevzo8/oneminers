"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import SearchSelect from "./SearchSelect";

type Option = { slug: string; label: string };

const SIZES = [
  { key: "wide", label: "Wide (780px)", width: "780", height: "230" },
  { key: "card", label: "Card (320px)", width: "320", height: "330" },
  { key: "responsive", label: "Responsive", width: "100%", height: "260" },
] as const;

export default function WidgetBuilder({ miners }: { miners: Option[] }) {
  const [slug, setSlug] = useState(miners[0]?.slug ?? "");
  const [electricity, setElectricity] = useState(0.07);
  const [size, setSize] = useState<(typeof SIZES)[number]["key"]>("wide");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const chosen = SIZES.find((s) => s.key === size) ?? SIZES[0];
  const label = miners.find((m) => m.slug === slug)?.label ?? "ASIC miner";
  const src = `${origin}/embed/miner/${slug}?e=${electricity}&theme=${theme}`;
  const code = `<iframe src="${src}" width="${chosen.width}" height="${chosen.height}" style="border:0;max-width:100%" loading="lazy" title="${label} profitability"></iframe>`;

  function copy(text: string, what: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(what);
      window.setTimeout(() => setCopied(""), 1600);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="surface space-y-4 rounded-2xl p-5">
        <div className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Miner</span>
          <SearchSelect
            value={slug}
            options={miners.map((m) => ({ value: m.slug, label: m.label }))}
            onChange={setSlug}
            label="Miner"
            className="mt-1.5 w-full"
          />
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Default electricity ($/kWh)</span>
          <input type="number" min={0} step={0.005} value={electricity} onChange={(event) => setElectricity(Math.max(0, Number(event.target.value) || 0))} className="input mt-1.5" />
        </label>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Size</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SIZES.map((s) => (
              <button key={s.key} type="button" onClick={() => setSize(s.key)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${size === s.key ? "border-accent/40 bg-accent/15 text-accent" : "border-line text-muted hover:text-ink"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Theme</span>
          <div className="mt-1.5 flex gap-1.5">
            {(["dark", "light"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${theme === t ? "border-accent/40 bg-accent/15 text-accent" : "border-line text-muted hover:text-ink"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Embed code</span>
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-line bg-black/30 p-3 font-mono text-sm text-aqua">{code}</pre>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => copy(code, "code")} className="btn-primary px-4 py-2 text-xs">
              {copied === "code" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy embed code
            </button>
            <button type="button" onClick={() => copy(src, "url")} className="btn-ghost px-4 py-2 text-xs">
              {copied === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy URL
            </button>
          </div>
        </div>
        <p className="text-sm text-muted/70">Visitors can change the electricity price and number of units inside the widget. Please keep the credit link visible.</p>
      </div>
      <div className="surface overflow-hidden rounded-2xl p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Live preview</div>
        {origin ? (
          <iframe key={src + size} src={src} width={chosen.width} height={chosen.height} style={{ border: 0, maxWidth: "100%" }} title={`${label} profitability preview`} />
        ) : null}
      </div>
    </div>
  );
}
