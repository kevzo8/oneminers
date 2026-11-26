"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useFxRates } from "@/lib/useMoney";
import SearchSelect from "./SearchSelect";

export default function CoinConverter({ tag, priceUsd }: { tag: string; priceUsd: number }) {
  const rates = useFxRates();
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [reverse, setReverse] = useState(false);
  const rate = rates[currency] ?? (currency === "USD" ? 1 : NaN);
  const fiatPerCoin = priceUsd * rate;
  const result = reverse ? amount / fiatPerCoin : amount * fiatPerCoin;

  return (
    <div className="surface rounded-2xl p-5">
      <h2 className="text-lg font-bold text-ink">{tag} converter</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} className="input w-40" aria-label="Amount" />
        <span className="text-sm font-semibold text-muted">{reverse ? currency : tag}</span>
        <button type="button" onClick={() => setReverse((v) => !v)} className="btn-ghost h-9 w-9 p-0" aria-label="Swap direction">
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        {reverse ? (
          <span className="text-sm font-semibold text-muted">{tag}</span>
        ) : (
          <SearchSelect<string>
            value={currency}
            options={CURRENCIES.filter((c) => c === "USD" || rates[c])}
            onChange={setCurrency}
            label="Currency"
            className="w-24"
          />
        )}
      </div>
      <div className="mt-4 text-2xl font-bold tabular-nums text-ink">
        {Number.isFinite(result)
          ? reverse
            ? `${result.toLocaleString("en-US", { maximumSignificantDigits: 8 })} ${tag}`
            : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: result < 1 ? 6 : 2 }).format(result)
          : "—"}
      </div>
      <p className="mt-1 text-[11px] text-muted/70">Live price; exchange rates via CoinGecko.</p>
    </div>
  );
}
