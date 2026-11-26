"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type MiningSettings } from "./economics";

const KEY = "om.mining-settings.v1";
const EVENT = "om-mining-settings";

function read(): MiningSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<MiningSettings>;
    const electricity = Number(parsed.electricity);
    const poolFee = Number(parsed.poolFee);
    return {
      electricity: Number.isFinite(electricity) && electricity >= 0 ? electricity : DEFAULT_SETTINGS.electricity,
      poolFee: Number.isFinite(poolFee) && poolFee >= 0 && poolFee < 100 ? poolFee : DEFAULT_SETTINGS.poolFee,
      currency: typeof parsed.currency === "string" && /^[A-Z]{3}$/.test(parsed.currency) ? parsed.currency : "USD",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Electricity price and pool fee, shared by every directory page and saved in this browser. */
export function useMiningSettings() {
  const [settings, setSettings] = useState<MiningSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(read());
    const sync = () => setSettings(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<MiningSettings>) => {
    const next = { ...read(), ...patch };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [settings, update] as const;
}
