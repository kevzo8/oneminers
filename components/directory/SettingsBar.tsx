"use client";

import { Zap, Percent } from "lucide-react";
import { ELECTRICITY_PRESETS } from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";

export default function SettingsBar({ compact = false }: { compact?: boolean }) {
  const [settings, update] = useMiningSettings();

  return (
    <div className={`surface flex flex-col gap-3 rounded-2xl p-3 ${compact ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-2">
          <Zap className="h-4 w-4 text-amber" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Power</span>
          <span className="text-sm text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={1}
            step={0.005}
            value={settings.electricity}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 0) update({ electricity: value });
            }}
            className="w-16 bg-transparent text-sm font-semibold tabular-nums text-ink outline-none"
            aria-label="Electricity price in USD per kWh"
          />
          <span className="text-xs text-muted">/kWh</span>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-2">
          <Percent className="h-4 w-4 text-aqua" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Pool fee</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={10}
            step={0.5}
            value={settings.poolFee}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 0 && value < 100) update({ poolFee: value });
            }}
            className="w-10 bg-transparent text-sm font-semibold tabular-nums text-ink outline-none"
            aria-label="Pool fee in percent"
          />
          <span className="text-xs text-muted">%</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ELECTRICITY_PRESETS.map((preset) => {
          const active = Math.abs(settings.electricity - preset.value) < 0.0005;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => update({ electricity: preset.value })}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                active ? "border-accent/40 bg-accent/15 text-accent" : "border-line bg-white/[0.03] text-muted hover:text-ink"
              }`}
            >
              {preset.label} · {(preset.value * 100).toFixed(1)}¢
            </button>
          );
        })}
      </div>
    </div>
  );
}
