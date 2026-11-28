import Link from "next/link";
import type { MinerModel } from "@/lib/catalog";
import { formatUsd } from "@/lib/economics";
import { SPEC_SOURCES, type MinerSpecs } from "@/lib/miner-specs";

type SpecItem = { label: string; value: string; hint?: string };

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Dense spec panel for the hero card. Shows only values that are not already
 * in the headline tiles (hashrate / power / efficiency) or the chips
 * (algorithm / cooling / coin), so nothing is duplicated.
 */
export function HeroSpecs({ miner, specs }: { miner: MinerModel; specs?: MinerSpecs }) {
  const kwhPerDay = (miner.powerW / 1000) * 24;
  const btuPerHour = miner.powerW * 3.412142;
  const dbMarket = miner.priceRange && !miner.priceRange.estimated ? miner.priceRange : undefined;
  const market = dbMarket ?? specs?.priceRange;

  const items: SpecItem[] = [];

  if (specs?.releaseDate) items.push({ label: "Released", value: formatDate(specs.releaseDate) });
  items.push({ label: "Energy / day", value: `${kwhPerDay.toFixed(1)} kWh` });
  items.push({ label: "Heat output", value: `${Math.round(btuPerHour).toLocaleString("en-US")} BTU/h` });
  items.push({ label: "Energy / year", value: `${Math.round(kwhPerDay * 365).toLocaleString("en-US")} kWh` });

  if (market) {
    const range =
      market.min === market.max ? formatUsd(market.min, 0) : `${formatUsd(market.min, 0)} – ${formatUsd(market.max, 0)}`;
    items.push({
      label: "Market range",
      value: range,
      hint: `${market.count} ${market.count === 1 ? "listing" : "listings"} · ${String(market.condition).toLowerCase()}`,
    });
    items.push({ label: "Market median", value: formatUsd(market.median, 0) });
  }

  if (specs?.noiseDb) items.push({ label: "Noise", value: `${specs.noiseDb} dB` });
  if (specs?.dimensions) {
    const { length, width, height } = specs.dimensions;
    items.push({ label: "Dimensions", value: `${length} × ${width} × ${height} mm` });
  }
  if (specs?.weightKg) items.push({ label: "Net weight", value: `${specs.weightKg} kg` });
  if (specs?.voltage) items.push({ label: "Input voltage", value: specs.voltage });
  if (specs?.psu) items.push({ label: "Power supply", value: specs.psu, hint: specs.psuDetail });
  if (specs?.currentA) items.push({ label: "Max current", value: `${specs.currentA} A` });
  if (specs?.circuit) items.push({ label: "Circuit", value: specs.circuit });
  if (specs?.interface) items.push({ label: "Network", value: specs.interface });
  if (specs?.inletWaterC) items.push({ label: "Inlet water", value: specs.inletWaterC });
  else if (specs?.operatingTempC) items.push({ label: "Operating temp", value: specs.operatingTempC });
  if (specs?.humidity) items.push({ label: "Humidity", value: specs.humidity });
  if (specs?.fanCount) {
    items.push({
      label: "Fans",
      value: `${specs.fanCount}${specs.fanSize ? ` × ${specs.fanSize}` : ""}${specs.fanRpm ? ` · ${specs.fanRpm.toLocaleString("en-US")} RPM` : ""}`,
    });
  }
  if (specs?.airflowCfm) items.push({ label: "Airflow", value: `${specs.airflowCfm} CFM` });
  if (specs?.storageTempC) items.push({ label: "Storage temp", value: specs.storageTempC });
  if (specs?.altitudeM) items.push({ label: "Altitude", value: specs.altitudeM });
  if (specs?.waterFlow) items.push({ label: "Water flow", value: specs.waterFlow });
  if (specs?.waterPressure) items.push({ label: "Water pressure", value: specs.waterPressure });

  const shown = items.slice(0, 18);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel-soft p-3">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {shown.map((item) => (
            <div key={item.label} className="min-w-0 rounded-xl border border-line/60 bg-black/20 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</dt>
              <dd className="mt-0.5 text-xs font-bold tabular-nums text-ink">{item.value}</dd>
              {item.hint ? <div className="mt-0.5 text-xs leading-snug text-muted/70">{item.hint}</div> : null}
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted/70">
        Specs: manufacturer datasheets via{" "}
        <a href={SPEC_SOURCES.dcentral.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
          D-Central
        </a>{" "}
        (CC BY 4.0) and{" "}
        <a href={SPEC_SOURCES.whattomine.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
          WhatToMine
        </a>
        . Market:{" "}
        <a href={SPEC_SOURCES.backpow.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
          BackPoW
        </a>{" "}
        (CC BY 4.0).{" "}
        <Link href={`/report?miner=${miner.slug}`} className="underline hover:text-ink">
          Report an error
        </Link>
        .
      </p>
    </div>
  );
}
