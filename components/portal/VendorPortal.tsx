"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Link2,
  Loader2,
  MessageSquareQuote,
  MousePointerClick,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

export type PortalMiner = { slug: string; label: string; refPrice: number };

type Stock = "In stock" | "Pre-order" | "Out of stock";
type Listing = { id: string; minerSlug: string; price: number; stock: Stock; condition: "New" | "Refurbished" };
type LinkStatus = { url: string; state: "unchecked" | "found" | "missing" | "error"; checkedAt?: number; nofollow?: boolean; message?: string };
type Profile = { company: string; website: string; country: string; email: string; joinedAt: number; canceled: boolean };
type PortalState = { profile: Profile | null; listings: Listing[]; link: LinkStatus };

const KEY = "om.vendor-portal.v1";
const TRIAL_MONTHS = 6;
const PRICE = 100;
const EMPTY: PortalState = { profile: null, listings: [], link: { url: "", state: "unchecked" } };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function addMonths(time: number, months: number) {
  const date = new Date(time);
  date.setMonth(date.getMonth() + months);
  return date.getTime();
}

function seed(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export default function VendorPortal({ miners }: { miners: PortalMiner[] }) {
  const [state, setState] = useState<PortalState>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as PortalState) });
    } catch {
      // ignore corrupted demo state
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  if (!loaded) {
    return (
      <div className="grid place-items-center py-24 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!state.profile) {
    return <Onboarding miners={miners} onCreate={(next) => setState(next)} />;
  }

  return <Dashboard miners={miners} state={state} setState={setState} />;
}

function Onboarding({ miners, onCreate }: { miners: PortalMiner[]; onCreate: (state: PortalState) => void }) {
  const [form, setForm] = useState({ company: "", website: "", country: "", email: "" });

  function create(sample: boolean) {
    const profile: Profile = sample
      ? { company: "Demo Mining Supply", website: "https://example.com", country: "Philippines", email: "sales@example.com", joinedAt: Date.now(), canceled: false }
      : { ...form, joinedAt: Date.now(), canceled: false };
    const listings: Listing[] = sample
      ? miners.slice(0, 4).map((miner, index) => ({
          id: uid(),
          minerSlug: miner.slug,
          price: Math.round(miner.refPrice * (0.95 + index * 0.02)),
          stock: index === 3 ? "Pre-order" : "In stock",
          condition: "New",
        }))
      : [];
    onCreate({ profile, listings, link: { url: sample ? "https://example.com/partners" : "", state: "unchecked" } });
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_1fr]">
      <div>
        <div className="chip text-accent">Seller portal</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Manage your listings in <span className="text-gradient">one place.</span>
        </h1>
        <ul className="mt-6 space-y-3 text-sm text-muted">
          {[
            "6-month free trial, then $100/month, cancel anytime",
            "Add or bulk-import listings, update prices and stock",
            "Automatic partner-link check",
            "Views, clicks and quote requests every month",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => create(true)} className="btn-ghost mt-6 px-5 py-2.5 text-sm">
          Explore with sample data
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          create(false);
        }}
        className="surface-strong space-y-4 rounded-3xl p-6"
      >
        <h2 className="text-lg font-bold text-ink">Create seller account</h2>
        {(
          [
            ["company", "Company name", "text"],
            ["website", "Website", "url"],
            ["country", "Country", "text"],
            ["email", "Work email", "email"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
            <input
              required
              type={type}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              className="input mt-1.5"
              placeholder={type === "url" ? "https://" : undefined}
            />
          </label>
        ))}
        <button type="submit" className="btn-primary w-full px-5 py-3 text-sm">
          Start free trial
        </button>
        <p className="text-center text-[11px] text-muted/70">Demo: your data stays in this browser only.</p>
      </form>
    </div>
  );
}

function Dashboard({
  miners,
  state,
  setState,
}: {
  miners: PortalMiner[];
  state: PortalState;
  setState: React.Dispatch<React.SetStateAction<PortalState>>;
}) {
  const profile = state.profile as Profile;
  const minerMap = useMemo(() => new Map(miners.map((miner) => [miner.slug, miner])), [miners]);
  const live = state.link.state === "found";

  const trialEnd = addMonths(profile.joinedAt, TRIAL_MONTHS);
  const now = Date.now();
  const inTrial = now < trialEnd;
  const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / 86_400_000));
  const trialProgress = Math.min(100, Math.max(2, ((now - profile.joinedAt) / (trialEnd - profile.joinedAt)) * 100));

  const s = seed(profile.company);
  const active = state.listings.filter((listing) => listing.stock !== "Out of stock").length;
  const kpis = [
    { icon: Eye, label: "Profile views · 30d", value: live ? 120 + active * 37 + (s % 90) : 0 },
    { icon: MousePointerClick, label: "Offer clicks · 30d", value: live ? 18 + active * 9 + (s % 23) : 0 },
    { icon: MessageSquareQuote, label: "Quote requests · 30d", value: live ? 2 + Math.floor(active / 2) + (s % 4) : 0 },
    { icon: BarChart3, label: "Active listings", value: active },
  ];

  const update = (patch: Partial<PortalState>) => setState((prev) => ({ ...prev, ...patch }));
  const updateProfile = (patch: Partial<Profile>) => setState((prev) => ({ ...prev, profile: { ...(prev.profile as Profile), ...patch } }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="chip text-accent">Seller portal · demo</div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{profile.company}</h1>
          <p className="text-xs text-muted">
            {profile.country} · {profile.website} · {profile.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset the demo portal? This clears the data saved in this browser.")) setState(EMPTY);
          }}
          className="btn-ghost px-4 py-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset demo
        </button>
      </div>

      {!live ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your listings are <strong>pending</strong>. They go live once your partner link to OneMiners is verified below.
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="surface rounded-2xl p-4">
            <kpi.icon className="h-4 w-4 text-aqua" />
            <div className="mt-2 text-2xl font-bold tabular-nums text-ink">{kpi.value.toLocaleString("en-US")}</div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-muted">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          inTrial={inTrial}
          daysLeft={daysLeft}
          trialEnd={trialEnd}
          progress={trialProgress}
          canceled={profile.canceled}
          onToggle={() => updateProfile({ canceled: !profile.canceled })}
        />
        <PartnerLinkCard link={state.link} onChange={(link) => update({ link })} />
      </div>

      <ListingsCard miners={miners} minerMap={minerMap} listings={state.listings} live={live} onChange={(listings) => update({ listings })} />
    </div>
  );
}

function PlanCard({
  inTrial,
  daysLeft,
  trialEnd,
  progress,
  canceled,
  onToggle,
}: {
  inTrial: boolean;
  daysLeft: number;
  trialEnd: number;
  progress: number;
  canceled: boolean;
  onToggle: () => void;
}) {
  const endLabel = new Date(trialEnd).toLocaleDateString("en-US", { dateStyle: "medium" });
  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Plan</div>
          <div className="mt-1 text-xl font-bold text-ink">{inTrial ? "Free trial" : canceled ? "Canceled" : "Listing plan"}</div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
            canceled ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {canceled ? "Ends at period end" : "Active"}
        </span>
      </div>
      {inTrial ? (
        <>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-aqua" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            <strong className="text-ink">{daysLeft} days</strong> of free listing left, until {endLabel}.
          </p>
        </>
      ) : null}
      <p className="mt-3 text-sm text-muted">
        {canceled
          ? `No charges after ${endLabel}. Your listings go offline then.`
          : `Then $${PRICE}/month, no commission. First charge on ${endLabel}. A reminder is emailed 14 days before.`}
      </p>
      <button type="button" onClick={onToggle} className="btn-ghost mt-4 px-4 py-2 text-xs">
        {canceled ? "Resume plan" : "Cancel anytime"}
      </button>
    </div>
  );
}

function PartnerLinkCard({ link, onChange }: { link: LinkStatus; onChange: (link: LinkStatus) => void }) {
  const [url, setUrl] = useState(link.url);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    try {
      const res = await fetch("/api/partner-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = (await res.json()) as { found?: boolean; error?: string; links?: { nofollow: boolean }[]; status?: number };
      if (!res.ok || json.error) {
        onChange({ url, state: "error", checkedAt: Date.now(), message: json.error ?? "Check failed." });
      } else {
        onChange({
          url,
          state: json.found ? "found" : "missing",
          checkedAt: Date.now(),
          nofollow: Boolean(json.links?.length && json.links.every((entry) => entry.nofollow)),
          message: json.found ? undefined : `No link to oneminers.com found on that page (HTTP ${json.status}).`,
        });
      }
    } catch {
      onChange({ url, state: "error", checkedAt: Date.now(), message: "Couldn't reach the checker." });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-aqua" />
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Partner link</div>
      </div>
      <p className="mt-2 text-sm text-muted">The page on your site that links to oneminers.com.</p>
      <div className="mt-3 flex gap-2">
        <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yoursite.com/partners" className="input" />
        <button type="button" onClick={check} disabled={checking || !url} className="btn-primary shrink-0 px-4 text-xs disabled:opacity-60">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </div>
      <div className="mt-3 text-xs">
        {link.state === "found" ? (
          <p className="flex items-center gap-1.5 text-accent">
            <CheckCircle2 className="h-4 w-4" /> Link verified. Listings are live.
            {link.nofollow ? <span className="text-amber"> (marked nofollow/sponsored)</span> : null}
          </p>
        ) : link.state === "missing" || link.state === "error" ? (
          <p className="flex items-center gap-1.5 text-red-300">
            <XCircle className="h-4 w-4" /> {link.message}
          </p>
        ) : (
          <p className="text-muted">Not checked yet. We re-check weekly and email you if the link disappears.</p>
        )}
        {link.checkedAt ? (
          <p className="mt-1 text-[10px] text-muted/70">Last checked {new Date(link.checkedAt).toLocaleString("en-US")}</p>
        ) : null}
      </div>
    </div>
  );
}

function ListingsCard({
  miners,
  minerMap,
  listings,
  live,
  onChange,
}: {
  miners: PortalMiner[];
  minerMap: Map<string, PortalMiner>;
  listings: Listing[];
  live: boolean;
  onChange: (listings: Listing[]) => void;
}) {
  const [csvOpen, setCsvOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [csvResult, setCsvResult] = useState("");

  const edit = (id: string, patch: Partial<Listing>) => onChange(listings.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  function addRow() {
    const used = new Set(listings.map((row) => row.minerSlug));
    const next = miners.find((miner) => !used.has(miner.slug)) ?? miners[0];
    onChange([...listings, { id: uid(), minerSlug: next.slug, price: next.refPrice, stock: "In stock", condition: "New" }]);
  }

  function importCsv() {
    const added: Listing[] = [];
    let skipped = 0;
    for (const line of csv.split(/\r?\n/)) {
      const [slug, price, stock] = line.split(",").map((cell) => cell?.trim());
      if (!slug || slug.toLowerCase() === "model") continue;
      const miner = minerMap.get(slug);
      const amount = Number(price);
      if (!miner || !(amount > 0)) {
        skipped += 1;
        continue;
      }
      const stockValue: Stock = stock === "Pre-order" || stock === "Out of stock" ? stock : "In stock";
      added.push({ id: uid(), minerSlug: miner.slug, price: Math.round(amount), stock: stockValue, condition: "New" });
    }
    onChange([...listings, ...added]);
    setCsvResult(`Imported ${added.length} listing${added.length === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} invalid row${skipped === 1 ? "" : "s"}` : ""}.`);
    setCsv("");
  }

  return (
    <div className="surface rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Your listings</h2>
          <p className="text-xs text-muted">Changes publish instantly to each miner&apos;s &ldquo;Where to buy&rdquo; table.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCsvOpen((open) => !open)} className="btn-ghost px-4 py-2 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Import CSV
          </button>
          <button type="button" onClick={addRow} className="btn-primary px-4 py-2 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add listing
          </button>
        </div>
      </div>

      {csvOpen ? (
        <div className="space-y-2 border-b border-line p-5">
          <p className="text-xs text-muted">
            One listing per line: <code className="text-aqua">model-id,price,stock</code>. Model IDs are the last part of each
            miner page URL.
          </p>
          <textarea
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            rows={4}
            className="input resize-none font-mono text-xs"
            placeholder={`${miners[0]?.slug},${miners[0]?.refPrice},In stock\n${miners[1]?.slug},${miners[1]?.refPrice},Pre-order`}
          />
          <div className="flex items-center gap-3">
            <button type="button" onClick={importCsv} disabled={!csv.trim()} className="btn-primary px-4 py-2 text-xs disabled:opacity-60">
              Import
            </button>
            {csvResult ? <span className="text-xs text-muted">{csvResult}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3 font-semibold">Model</th>
              <th className="px-5 py-3 font-semibold">Price (USD)</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 font-semibold">Condition</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {listings.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-2.5">
                  <select
                    value={row.minerSlug}
                    onChange={(event) => edit(row.id, { minerSlug: event.target.value })}
                    className="input py-2 text-xs"
                    aria-label="Model"
                  >
                    {miners.map((miner) => (
                      <option key={miner.slug} value={miner.slug} className="bg-[#0b1016]">
                        {miner.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    min={1}
                    value={row.price}
                    onChange={(event) => edit(row.id, { price: Math.max(0, Number(event.target.value) || 0) })}
                    className="input w-28 py-2 text-xs tabular-nums"
                    aria-label="Price"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <select
                    value={row.stock}
                    onChange={(event) => edit(row.id, { stock: event.target.value as Stock })}
                    className="input py-2 text-xs"
                    aria-label="Stock"
                  >
                    {(["In stock", "Pre-order", "Out of stock"] as const).map((value) => (
                      <option key={value} className="bg-[#0b1016]">
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-2.5">
                  <select
                    value={row.condition}
                    onChange={(event) => edit(row.id, { condition: event.target.value as Listing["condition"] })}
                    className="input py-2 text-xs"
                    aria-label="Condition"
                  >
                    {(["New", "Refurbished"] as const).map((value) => (
                      <option key={value} className="bg-[#0b1016]">
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-2.5 text-xs">
                  {live ? (
                    <Link href={`/miners/${row.minerSlug}#offers`} className="font-semibold text-accent hover:underline">
                      Live
                    </Link>
                  ) : (
                    <span className="font-semibold text-amber">Pending link</span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onChange(listings.filter((item) => item.id !== row.id))}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/[0.06] hover:text-red-300"
                    aria-label="Delete listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                  No listings yet. Add one or import a CSV.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
