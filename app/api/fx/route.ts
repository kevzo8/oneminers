import { NextResponse } from "next/server";
import { CURRENCIES } from "@/lib/currency";

export const runtime = "nodejs";
export const revalidate = 600;


/** Exchange rates per 1 USD, derived from CoinGecko's Bitcoin price in each currency. */
export async function GET() {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${CURRENCIES.map((c) => c.toLowerCase()).join(",")}`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(String(res.status));
    const btc = ((await res.json()) as { bitcoin?: Record<string, number> }).bitcoin ?? {};
    const usd = btc.usd;
    if (!usd) throw new Error("no usd");
    const rates: Record<string, number> = {};
    for (const code of CURRENCIES) {
      const value = btc[code.toLowerCase()];
      if (value) rates[code] = value / usd;
    }
    return NextResponse.json({ rates, source: "coingecko", updatedAt: Date.now() });
  } catch {
    return NextResponse.json({ rates: { USD: 1 }, source: "fallback", updatedAt: Date.now() });
  }
}
