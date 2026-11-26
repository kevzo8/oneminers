"use client";

import { useCallback, useEffect, useState } from "react";
import { useMiningSettings } from "./useMiningSettings";

let ratesPromise: Promise<Record<string, number>> | null = null;

function loadRates() {
  if (!ratesPromise) {
    ratesPromise = fetch("/api/fx")
      .then((res) => (res.ok ? res.json() : { rates: { USD: 1 } }))
      .then((data: { rates?: Record<string, number> }) => ({ USD: 1, ...(data.rates ?? {}) }))
      .catch(() => ({ USD: 1 }));
  }
  return ratesPromise;
}

export function useFxRates() {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  useEffect(() => {
    let alive = true;
    loadRates().then((value) => alive && setRates(value));
    return () => {
      alive = false;
    };
  }, []);
  return rates;
}

/** Formats a USD amount in the visitor's chosen currency (live rate; falls back to USD). */
export function useMoney() {
  const [settings] = useMiningSettings();
  const rates = useFxRates();
  const currency = settings.currency && rates[settings.currency] ? settings.currency : "USD";
  const rate = rates[currency] ?? 1;

  return useCallback(
    (usd: number, decimals = 2) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "JPY" ? 0 : decimals,
        maximumFractionDigits: currency === "JPY" ? 0 : decimals,
      }).format(usd * rate),
    [currency, rate]
  );
}
