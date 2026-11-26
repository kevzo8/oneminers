"use client";

import { Zap, Percent } from "lucide-react";
import { ELECTRICITY_PRESETS } from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import SearchSelect from "./SearchSelect";

export default function SettingsBar({ compact = false }: { compact?: boolean }) {
  const [settings, update] = useMiningSettings();
  const presetValue = ELECTRICITY_PRESETS.some((preset) => Math.abs(settings.electricity - preset.value) < 0.0005)
    ? settings.electricity
    : "";

  return (
    <div className={`surface flex flex-col gap-2 rounded-2xl p-3 sm:gap-3 ${compact ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
      <div className="flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-line bg-panel-soft px-2.5 py-1.5 sm:flex-none sm:gap-2 sm:px-3 sm:py-2">
          <Zap className="h-3.5 w-3.5 shrink-0 text-amber sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.1em] text-muted sm:inline">Power</span>
          <span className="text-xs text-muted">$</span>
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
            className="w-12 bg-transparent text-sm font-semibold tabular-nums text-ink outline-none sm:w-16"
            aria-label="Electricity price in USD per kWh"
          />
          <span className="text-[11px] text-muted sm:text-xs">/kWh</span>
        </label>
        <label className="flex items-center gap-1.5 rounded-xl border border-line bg-panel-soft px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
          <Percent className="h-3.5 w-3.5 shrink-0 text-aqua sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.1em] text-muted sm:inline">Pool fee</span>
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
            className="w-8 bg-transparent text-sm font-semibold tabular-nums text-ink outline-none sm:w-10"
            aria-label="Pool fee in percent"
          />
          <span className="text-xs text-muted">%</span>
        </label>
      </div>
      <SearchSelect<string>
        value={String(presetValue)}
        options={[
          ...(presetValue === "" ? [{ value: "", label: `Custom · ${(settings.electricity * 100).toFixed(1)}¢/kWh` }] : []),
          ...ELECTRICITY_PRESETS.map((preset) => ({
            value: String(preset.value),
            label: `${preset.label} · ${(preset.value * 100).toFixed(1)}¢`,
          })),
        ]}
        onChange={(value) => {
          if (value === "") return;
          const next = Number(value);
          if (Number.isFinite(next)) update({ electricity: next });
        }}
        label="Electricity preset"
        className="w-full sm:hidden"
      />
      <div className="hidden gap-1.5 sm:flex">
        {ELECTRICITY_PRESETS.map((preset) => {
          const active = Math.abs(settings.electricity - preset.value) < 0.0005;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => update({ electricity: preset.value })}
              title={preset.label}
              className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 ${
                active ? "border-accent/40 bg-accent/15 text-accent" : "border-line bg-panel-soft text-muted hover:text-ink"
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
