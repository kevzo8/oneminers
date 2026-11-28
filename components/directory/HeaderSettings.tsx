"use client";

import { Minus, Plus, Zap } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useMiningSettings } from "@/lib/useMiningSettings";
import SearchSelect from "./SearchSelect";
import ThemeToggle from "./ThemeToggle";

/** Global currency and electricity controls in the header; every table on the site follows them. */
export default function HeaderSettings() {
  const [settings, update] = useMiningSettings();
  const step = (delta: number) => update({ electricity: Math.max(0, Math.round((settings.electricity + delta) * 1000) / 1000) });

  return (
    <div className="flex items-center gap-1.5">
      <SearchSelect<string>
        value={settings.currency ?? "USD"}
        options={CURRENCIES}
        onChange={(currency) => update({ currency })}
        label="Currency"
        className="w-16"
      />
      <div className="flex items-center rounded-full border border-line bg-panel-soft pl-2.5">
          <Zap className="h-4 w-4 text-amber" aria-hidden="true" />
          <span className="ml-1 text-sm text-muted">$</span>
        <input
          type="number"
          min={0}
          step={0.005}
          value={settings.electricity}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && value >= 0) update({ electricity: value });
          }}
            className="w-14 bg-transparent text-sm font-semibold tabular-nums text-ink outline-none"
          aria-label="Electricity price in USD per kWh"
        />
        <span className="text-sm text-muted">/kWh</span>
        <button type="button" onClick={() => step(-0.005)} className="ml-1 grid h-7 w-6 place-items-center text-muted hover:text-ink" aria-label="Lower electricity price">
          <Minus className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => step(0.005)} className="grid h-7 w-6 place-items-center pr-1 text-muted hover:text-ink" aria-label="Raise electricity price">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <ThemeToggle />
    </div>
  );
}
