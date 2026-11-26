"use client";

import { useState } from "react";
import SearchSelect from "./SearchSelect";

const UNITS = [
  { label: "H/s", factor: 1 },
  { label: "kH/s", factor: 1e3 },
  { label: "MH/s", factor: 1e6 },
  { label: "GH/s", factor: 1e9 },
  { label: "TH/s", factor: 1e12 },
  { label: "PH/s", factor: 1e15 },
  { label: "EH/s", factor: 1e18 },
  { label: "ZH/s", factor: 1e21 },
];

function format(value: number) {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1e6 || Math.abs(value) < 1e-4) return value.toExponential(4);
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export default function HashrateConverter() {
  const [value, setValue] = useState(473);
  const [unit, setUnit] = useState("TH/s");
  const [watts, setWatts] = useState(5676);
  const hs = value * (UNITS.find((u) => u.label === unit)?.factor ?? 1);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface space-y-4 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-ink">Hashrate</h2>
        <div className="flex gap-2">
          <input type="number" min={0} value={value} onChange={(event) => setValue(Number(event.target.value) || 0)} className="input text-lg font-semibold" aria-label="Hashrate value" />
          <SearchSelect
            value={unit}
            options={UNITS.map((u) => u.label)}
            onChange={setUnit}
            label="Unit"
            className="w-32"
          />
        </div>
        <div className="divide-y divide-line/60 rounded-xl border border-line">
          {UNITS.map((u) => (
            <div key={u.label} className={`flex items-center justify-between px-4 py-2.5 text-sm ${u.label === unit ? "bg-accent/[0.06]" : ""}`}>
              <span className="text-muted">{u.label}</span>
              <span className="font-semibold tabular-nums text-ink">{format(hs / u.factor)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted/70">Equihash miners are rated in Sol/s (solutions per second); the same prefixes apply (1 kSol/s = 1,000 Sol/s).</p>
      </div>

      <div className="surface space-y-4 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-ink">Efficiency</h2>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Power draw (W)</span>
          <input type="number" min={0} value={watts} onChange={(event) => setWatts(Number(event.target.value) || 0)} className="input mt-1.5" />
        </label>
        <div className="divide-y divide-line/60 rounded-xl border border-line">
          {UNITS.slice(1, 6).map((u) => (
            <div key={u.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted">J/{u.label.replace("/s", "")}</span>
              <span className="font-semibold tabular-nums text-ink">{hs > 0 ? format(watts / (hs / u.factor)) : "—"}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-line px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.1em] text-muted">Energy / day</div>
            <div className="font-semibold tabular-nums text-ink">{format((watts / 1000) * 24)} kWh</div>
          </div>
          <div className="rounded-xl border border-line px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.1em] text-muted">Energy / month</div>
            <div className="font-semibold tabular-nums text-ink">{format((watts / 1000) * 24 * 30)} kWh</div>
          </div>
        </div>
      </div>
    </div>
  );
}
