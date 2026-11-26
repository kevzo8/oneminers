import Link from "next/link";
import { BadgeCheck, ChevronRight, Handshake } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { Cooling, VendorTier } from "@/lib/catalog";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  HK: "Hong Kong",
  DE: "Germany",
  CN: "China",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  PH: "Philippines",
  CZ: "Czechia",
};
import type { Algorithm } from "@/lib/economics";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />
      <main className="pt-24 pb-20">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted">
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-3 w-3 opacity-50" /> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const MAKER_COLORS: Record<string, [string, string]> = {
  Bitmain: ["#ffb340", "#ff7a1a"],
  MicroBT: ["#4de1ff", "#2f7bff"],
  Canaan: ["#b9ff66", "#3ccf7a"],
  IceRiver: ["#9fe8ff", "#5aa8ff"],
  Goldshell: ["#ffd166", "#f4a300"],
  ElphaPex: ["#c4a1ff", "#8b5cf6"],
  Bitaxe: ["#ff8fa3", "#ff4d6d"],
};

const ALGO_SHORT: Record<Algorithm, string> = {
  "SHA-256": "SHA256",
  Scrypt: "SCRYPT",
  kHeavyHash: "KHEAVY",
  Equihash: "EQUI",
  Etchash: "ETCHASH",
  X11: "X11",
  Eaglesong: "EAGLE",
};

/** Stylised ASIC illustration, coloured by manufacturer. */
export function MinerGlyph({
  manufacturer,
  algorithm,
  cooling,
  size = "md",
}: {
  manufacturer: string;
  algorithm: Algorithm;
  cooling: Cooling;
  size?: "sm" | "md" | "lg";
}) {
  const [from, to] = MAKER_COLORS[manufacturer] ?? ["#93a1ad", "#5b6875"];
  const id = `g-${manufacturer}-${size}`.replace(/\W/g, "");
  const box = size === "sm" ? "h-10 w-10 rounded-xl" : size === "lg" ? "h-56 w-full rounded-3xl" : "h-24 w-full rounded-2xl";
  return (
    <div className={`relative grid place-items-center overflow-hidden border border-line bg-panel-soft ${box}`}>
      <svg viewBox="0 0 120 80" className={size === "sm" ? "h-7 w-7" : "h-4/5 w-4/5"} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <rect x="14" y="14" width="92" height="52" rx="6" fill="#0c1218" stroke={`url(#${id})`} strokeWidth="2" />
        {cooling === "Air" ? (
          <>
            <circle cx="34" cy="40" r="15" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
            <circle cx="34" cy="40" r="4" fill={from} />
            <path d="M34 25v30M19 40h30M23.4 29.4l21.2 21.2M44.6 29.4 23.4 50.6" stroke={from} strokeOpacity="0.35" strokeWidth="1.5" />
            <circle cx="86" cy="40" r="15" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
            <circle cx="86" cy="40" r="4" fill={from} />
            <path d="M86 25v30M71 40h30M75.4 29.4l21.2 21.2M96.6 29.4 75.4 50.6" stroke={from} strokeOpacity="0.35" strokeWidth="1.5" />
          </>
        ) : (
          <>
            {[26, 36, 46, 56].map((y) => (
              <rect key={y} x="24" y={y - 3} width="72" height="4" rx="2" fill={from} fillOpacity="0.55" />
            ))}
            <circle cx="20" cy="26" r="3.5" fill={to} />
            <circle cx="20" cy="54" r="3.5" fill={to} />
          </>
        )}
      </svg>
      {size === "sm" ? null : (
        <span className="absolute bottom-2 right-3 font-mono text-[9px] font-bold tracking-[0.2em] text-muted/80">
          {ALGO_SHORT[algorithm]}
        </span>
      )}
    </div>
  );
}

const TIER_STYLES: Record<VendorTier, string> = {
  Gold: "border-amber/40 bg-amber/10 text-amber",
  Silver: "border-white/25 bg-panel-soft text-ink",
  Bronze: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  Free: "border-line bg-panel-soft text-muted",
};

export function TierBadge({ tier }: { tier: VendorTier }) {
  if (tier === "Free") return null;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${TIER_STYLES[tier]}`}>
      {tier}
    </span>
  );
}

export function VerifiedBadge({ verified, partner }: { verified: boolean; partner?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {verified ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent" title="Company registration checked">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <span className="text-[10px] font-medium text-muted">Unverified</span>
      )}
      {partner ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-aqua" title="Verified partner link">
          <Handshake className="h-3.5 w-3.5" />
          Partner
        </span>
      ) : null}
    </span>
  );
}

/** Country badge. Uses a code pill rather than emoji flags, which Windows doesn't render. */
export function Flag({ code, label }: { code: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={COUNTRY_NAMES[code] ?? code}>
      <span className="rounded border border-line bg-panel-soft px-1 py-px font-mono text-[9px] font-bold tracking-wider text-ink">
        {code}
      </span>
      {label && label !== code ? label : null}
    </span>
  );
}

export function SampleNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] leading-relaxed text-muted/70">{children}</p>;
}
