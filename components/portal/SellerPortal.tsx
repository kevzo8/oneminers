"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  Link2,
  Loader2,
  LogOut,
  PackageCheck,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import SignInPanel from "./SignInPanel";
import { COUNTRIES } from "./countries";

export type PortalMiner = { slug: string; label: string; refPrice: number };

type Stock = "In stock" | "Pre-order" | "Out of stock";
type Condition = "New" | "Refurbished";

/** Ask the site to refresh public pages right after a seller saves, so changes show immediately. */
function refreshPublic(paths: string[]) {
  void fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: Array.from(new Set(paths)).slice(0, 10) }),
  }).catch(() => undefined);
}

const GRACE_DAYS = 14;

function errorText(err: unknown) {
  if (err instanceof ConvexError) return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  const message = err instanceof Error ? err.message : String(err);
  // Convex wraps server errors; show only the human part.
  return message.replace(/^\[.*?\]\s*/, "").replace(/^Uncaught Error:\s*/, "").split("\n")[0].replace(/\s+at .*$/, "");
}

export default function SellerPortal({ miners }: { miners: PortalMiner[] }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignInPanel
        intro={
          <>
            <div className="chip text-accent">Seller portal</div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              List your miners in front of <span className="text-gradient">ready buyers.</span>
            </h1>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              {[
                "Launch promo: first 6 months free, then $100/month. No commission, cancel anytime",
                "Your prices on every matching miner page, with live ROI",
                "Add listings one by one or import a CSV",
                "Listings go live as soon as you add them",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </>
        }
      />
    );
  }

  return <SignedIn miners={miners} />;
}

function SignedIn({ miners }: { miners: PortalMiner[] }) {
  const me = useQuery(api.users.me);
  const data = useQuery(api.seller.myVendor);
  const { signOut } = useAuthActions();

  if (me === undefined || data === undefined) {
    return (
      <div className="grid place-items-center py-24 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted">
      {me?.role === "admin" ? (
        <Link href="/admin" className="btn-ghost px-3 py-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin
        </Link>
      ) : null}
      <button type="button" onClick={() => void signOut()} className="btn-ghost px-3 py-1.5 text-xs">
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </div>
  );

  if (!data?.vendor) {
    return (
      <div className="space-y-6">
        {header}
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Tell us about your company</h1>
          <p className="mt-2 text-sm text-muted">
            Your listings go live as soon as you add them. We verify companies within one business day.
          </p>
          <div className="mt-6">
            <CompanyForm />
          </div>
        </div>
        {me ? <p className="text-center text-[10px] text-muted/50">Account ID {me._id}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <Dashboard vendor={data.vendor} offers={data.offers} miners={miners} />
      {me ? <p className="text-center text-[10px] text-muted/50">Account ID {me._id}</p> : null}
    </div>
  );
}

function CompanyForm({ vendor, onDone }: { vendor?: Doc<"vendors">; onDone?: () => void }) {
  const createVendor = useMutation(api.seller.createVendor);
  const updateVendor = useMutation(api.seller.updateVendor);
  const [form, setForm] = useState({
    name: vendor?.name ?? "",
    website: vendor?.website ?? "",
    countryCode: vendor?.countryCode ?? "",
    about: vendor?.about ?? "",
    payments: vendor?.payments.join(", ") ?? "Bank transfer, USDT",
    contactEmail: vendor?.contactEmail ?? "",
    warrantyMonths: String(vendor?.warrantyMonths ?? 6),
    hosting: vendor?.hosting ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const args = {
      name: form.name,
      website: form.website,
      countryCode: form.countryCode,
      country: COUNTRIES.find(([code]) => code === form.countryCode)?.[1] ?? form.countryCode,
      about: form.about,
      payments: form.payments.split(",").map((p) => p.trim()).filter(Boolean),
      contactEmail: form.contactEmail,
      warrantyMonths: Number(form.warrantyMonths) || 0,
      hosting: form.hosting,
    };
    try {
      if (vendor) await updateVendor(args);
      else await createVendor(args);
      refreshPublic(["/vendors", ...(vendor ? [`/vendors/${vendor.slug}`] : [])]);
      onDone?.();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const input = (key: "name" | "website" | "contactEmail" | "payments" | "warrantyMonths", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <input {...props} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="input mt-1.5" />
    </label>
  );

  return (
    <form onSubmit={submit} className="surface-strong space-y-4 rounded-3xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {input("name", "Company name", { required: true, placeholder: "Acme Mining Supply Ltd." })}
        {input("website", "Website", { required: true, type: "url", placeholder: "https://" })}
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Country</span>
          <select
            required
            value={form.countryCode}
            onChange={(event) => setForm({ ...form, countryCode: event.target.value })}
            className="input mt-1.5"
          >
            <option value="" className="bg-[#0b1016]">Choose…</option>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code} className="bg-[#0b1016]">
                {name}
              </option>
            ))}
          </select>
        </label>
        {input("contactEmail", "Contact email (not public)", { required: true, type: "email" })}
        {input("payments", "Payment methods (comma separated)")}
        {input("warrantyMonths", "Warranty (months)", { type: "number", min: 0, max: 120 })}
      </div>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">About your company</span>
        <textarea
          value={form.about}
          onChange={(event) => setForm({ ...form, about: event.target.value })}
          rows={3}
          maxLength={600}
          className="input mt-1.5 resize-none"
          placeholder="Brands you carry, warehouse locations, delivery times…"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={form.hosting}
          onChange={(event) => setForm({ ...form, hosting: event.target.checked })}
          className="h-4 w-4 accent-[#b9ff66]"
        />
        We also offer hosting
      </label>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {vendor ? "Save changes" : "Create company profile"}
        </button>
        {onDone && vendor ? (
          <button type="button" onClick={onDone} className="btn-ghost px-4 py-2.5 text-sm">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Dashboard({ vendor, offers, miners }: { vendor: Doc<"vendors">; offers: Doc<"offers">[]; miners: PortalMiner[] }) {
  const [editing, setEditing] = useState(false);
  const linkOk = vendor.partnerLinkStatus === "found";
  const graceLeft = Math.max(0, Math.ceil((vendor.createdAt + GRACE_DAYS * 86_400_000 - Date.now()) / 86_400_000));
  const live = vendor.status !== "rejected" && (linkOk || graceLeft > 0);
  const inStock = offers.filter((offer) => offer.availability === "In stock").length;
  const daysLeft = vendor.trialEndsAt ? Math.max(0, Math.ceil((vendor.trialEndsAt - Date.now()) / 86_400_000)) : 0;

  const steps = [
    { done: true, label: "Company profile created" },
    { done: offers.length > 0, label: "Listings added (they go live right away)" },
    { done: linkOk, label: linkOk ? "Partner link verified" : `Partner link to oneminers.com: ${graceLeft} days left to add it` },
    { done: vendor.verified, label: "Verified badge (after our company check)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-ink">{vendor.name}</h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                live ? "border-accent/30 bg-accent/10 text-accent" : "border-amber/30 bg-amber/10 text-amber"
              }`}
            >
              {live ? "Live" : vendor.status === "rejected" ? "Rejected" : "Hidden: partner link missing"}
            </span>
            {vendor.verified ? <span className="text-[11px] font-semibold text-accent">✓ Verified</span> : null}
          </div>
          <p className="text-xs text-muted">
            {vendor.country} · {vendor.website}
          </p>
        </div>
        <div className="flex gap-2">
          {live ? (
            <Link href={`/vendors/${vendor.slug}`} className="btn-ghost px-4 py-2 text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> Public profile
            </Link>
          ) : null}
          <button type="button" onClick={() => setEditing((value) => !value)} className="btn-ghost px-4 py-2 text-xs">
            Edit company
          </button>
        </div>
      </div>

      {editing ? <CompanyForm vendor={vendor} onDone={() => setEditing(false)} /> : null}

      {!linkOk || !vendor.verified || !live ? (
        <div className="surface rounded-2xl p-5">
          <div className={`flex items-center gap-2 text-sm font-semibold ${live ? "text-accent" : "text-amber"}`}>
            {live ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {live
              ? "Your listings are live. Finish these steps to keep them public and earn the Verified badge."
              : vendor.status === "rejected"
                ? "Your company wasn't approved. Contact us for details."
                : "Your listings are hidden until your partner link is verified."}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-2 text-sm text-muted">
                {step.done ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Clock className="h-4 w-4 text-muted" />}
                <span className={step.done ? "text-ink" : ""}>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Listings", value: offers.length },
          { label: "In stock", value: inStock },
          { label: "Promo days left", value: daysLeft },
          { label: "Status", value: live ? "Public" : "Hidden" },
        ].map((kpi) => (
          <div key={kpi.label} className="surface rounded-2xl p-4">
            <div className="text-2xl font-bold tabular-nums text-ink">{kpi.value}</div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-muted">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard vendor={vendor} daysLeft={daysLeft} />
        <PartnerLinkCard vendor={vendor} />
      </div>

      <ListingsCard offers={offers} miners={miners} live={live} vendorSlug={vendor.slug} />
    </div>
  );
}

function PlanCard({ vendor, daysLeft }: { vendor: Doc<"vendors">; daysLeft: number }) {
  const setCanceled = useMutation(api.seller.setCanceled);
  const [busy, setBusy] = useState(false);
  const trialEnd = vendor.trialEndsAt ? new Date(vendor.trialEndsAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";
  const total = 183;
  const progress = Math.min(100, Math.max(2, ((total - daysLeft) / total) * 100));

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Plan</div>
          <div className="mt-1 text-xl font-bold text-ink">{daysLeft > 0 ? "Launch promo · 6 months free" : vendor.canceled ? "Canceled" : "Listing plan · $100/month"}</div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
            vendor.canceled ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {vendor.canceled ? "Ends after promo" : "Active"}
        </span>
      </div>
      {daysLeft > 0 ? (
        <>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-aqua" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            <strong className="text-ink">{daysLeft} days</strong> of the launch promo left, until {trialEnd}.
          </p>
        </>
      ) : null}
      <p className="mt-3 text-sm text-muted">
        {vendor.canceled
          ? `Your listings go offline after ${trialEnd}. No charges.`
          : `Then $100/month with no commission. Card billing is set up before ${trialEnd}; nothing is charged during the free period.`}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await setCanceled({ canceled: !vendor.canceled });
          } finally {
            setBusy(false);
          }
        }}
        className="btn-ghost mt-4 px-4 py-2 text-xs disabled:opacity-60"
      >
        {vendor.canceled ? "Resume plan" : "Cancel anytime"}
      </button>
    </div>
  );
}

function PartnerLinkCard({ vendor }: { vendor: Doc<"vendors"> }) {
  const checkMine = useAction(api.partnerLink.checkMine);
  const [url, setUrl] = useState(vendor.partnerLinkUrl ?? `${vendor.website.replace(/\/$/, "")}/partners`);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-aqua" />
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Partner link</div>
      </div>
      <p className="mt-2 text-sm text-muted">
        Add a link to <code className="text-aqua">https://oneminers.com</code> on your site (e.g. a partners page), then check it here.
      </p>
      <div className="mt-3 flex gap-2">
        <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yoursite.com/partners" className="input" />
        <button
          type="button"
          disabled={checking || !url}
          onClick={async () => {
            setChecking(true);
            setError("");
            try {
              await checkMine({ url });
            } catch (err) {
              setError(errorText(err));
            } finally {
              setChecking(false);
            }
          }}
          className="btn-primary shrink-0 px-4 text-xs disabled:opacity-60"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </button>
      </div>
      <div className="mt-3 text-xs">
        {error ? (
          <p className="text-red-300">{error}</p>
        ) : vendor.partnerLinkStatus === "found" ? (
          <p className="flex items-center gap-1.5 text-accent">
            <CheckCircle2 className="h-4 w-4" /> Link verified.
            {vendor.partnerLinkNofollow ? <span className="text-amber"> It&apos;s marked nofollow/sponsored.</span> : null}
          </p>
        ) : vendor.partnerLinkStatus ? (
          <p className="flex items-center gap-1.5 text-red-300">
            <XCircle className="h-4 w-4" /> {vendor.partnerLinkMessage ?? "Link not found."}
          </p>
        ) : (
          <p className="text-muted">Not checked yet. We re-check every week and pause listings if the link disappears.</p>
        )}
        {vendor.partnerLinkCheckedAt ? (
          <p className="mt-1 text-[10px] text-muted/70">Last checked {new Date(vendor.partnerLinkCheckedAt).toLocaleString("en-US")}</p>
        ) : null}
      </div>
    </div>
  );
}

type Draft = {
  key: string;
  offerId?: Id<"offers">;
  minerSlug: string;
  price: string;
  shipping: string;
  availability: Stock;
  condition: Condition;
  shipsFrom: string;
  psuIncluded: boolean;
  warrantyMonths: string;
};

function toDraft(offer: Doc<"offers">): Draft {
  return {
    key: offer._id,
    offerId: offer._id,
    minerSlug: offer.minerSlug,
    price: String(offer.price),
    shipping: String(offer.shipping),
    availability: offer.availability,
    condition: offer.condition,
    shipsFrom: offer.shipsFrom,
    psuIncluded: offer.psuIncluded,
    warrantyMonths: String(offer.warrantyMonths),
  };
}

function ListingsCard({ offers, miners, live, vendorSlug }: { offers: Doc<"offers">[]; miners: PortalMiner[]; live: boolean; vendorSlug: string }) {
  const upsertOffer = useMutation(api.seller.upsertOffer);
  const deleteOffer = useMutation(api.seller.deleteOffer);
  const importOffers = useMutation(api.seller.importOffers);
  const [drafts, setDrafts] = useState<Draft[]>(() => offers.map(toDraft));
  const [savingKey, setSavingKey] = useState("");
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [csvOpen, setCsvOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [csvResult, setCsvResult] = useState("");
  const minerMap = useMemo(() => new Map(miners.map((miner) => [miner.slug, miner])), [miners]);

  // Keep saved rows in sync with the database, but don't drop unsaved new rows.
  useEffect(() => {
    setDrafts((current) => [...offers.map(toDraft), ...current.filter((draft) => !draft.offerId)]);
  }, [offers]);

  const defaultShipsFrom = offers[0]?.shipsFrom ?? "US";

  function addRow() {
    const used = new Set(drafts.map((draft) => draft.minerSlug));
    const miner = miners.find((item) => !used.has(item.slug)) ?? miners[0];
    setDrafts((current) => [
      ...current,
      {
        key: `new-${Math.random().toString(36).slice(2)}`,
        minerSlug: miner.slug,
        price: String(miner.refPrice),
        shipping: "0",
        availability: "In stock",
        condition: "New",
        shipsFrom: defaultShipsFrom,
        psuIncluded: true,
        warrantyMonths: "6",
      },
    ]);
  }

  const edit = (key: string, patch: Partial<Draft>) => setDrafts((current) => current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));

  async function save(draft: Draft) {
    setSavingKey(draft.key);
    setRowError((current) => ({ ...current, [draft.key]: "" }));
    try {
      await upsertOffer({
        offerId: draft.offerId,
        minerSlug: draft.minerSlug,
        price: Number(draft.price),
        shipping: Number(draft.shipping) || 0,
        availability: draft.availability,
        condition: draft.condition,
        shipsFrom: draft.shipsFrom,
        psuIncluded: draft.psuIncluded,
        warrantyMonths: Number(draft.warrantyMonths) || 0,
      });
      if (!draft.offerId) setDrafts((current) => current.filter((item) => item.key !== draft.key));
      const before = offers.find((offer) => offer._id === draft.offerId)?.minerSlug;
      refreshPublic(["/", "/miners", `/miners/${draft.minerSlug}`, ...(before ? [`/miners/${before}`] : []), "/vendors", `/vendors/${vendorSlug}`]);
    } catch (err) {
      setRowError((current) => ({ ...current, [draft.key]: errorText(err) }));
    } finally {
      setSavingKey("");
    }
  }

  async function runImport() {
    const rows = csv
      .split(/\r?\n/)
      .map((line) => line.split(",").map((cell) => cell.trim()))
      .filter((cells) => cells[0] && cells[0].toLowerCase() !== "model")
      .map(([minerSlug, price, availability, shipping, shipsFrom]) => ({
        minerSlug,
        price: Number(price),
        shipping: Number(shipping) || 0,
        availability: (["In stock", "Pre-order", "Out of stock"].includes(availability) ? availability : "In stock") as Stock,
        condition: "New" as Condition,
        shipsFrom: shipsFrom || defaultShipsFrom,
        psuIncluded: true,
        warrantyMonths: 6,
      }));
    if (!rows.length) return;
    try {
      const result = await importOffers({ rows });
      refreshPublic(["/", "/miners", "/vendors", `/vendors/${vendorSlug}`, ...rows.slice(0, 6).map((row) => `/miners/${row.minerSlug}`)]);
      setCsvResult(
        `Added ${result.added}, updated ${result.updated}.${result.errors.length ? ` Problems: ${result.errors.join("; ")}` : ""}`
      );
      setCsv("");
    } catch (err) {
      setCsvResult(errorText(err));
    }
  }

  return (
    <div className="surface rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <PackageCheck className="h-5 w-5 text-accent" /> Your listings
          </h2>
          <p className="text-xs text-muted">
            {live ? "Saved listings appear on the public miner pages right away." : "Saved. They'll show publicly once your partner link is verified."}
          </p>
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
            One listing per line: <code className="text-aqua">model-id,price,availability,shipping,ships-from</code>. Model IDs are the
            last part of each miner page&apos;s URL. Existing listings for the same model are updated.
          </p>
          <textarea
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            rows={4}
            className="input resize-none font-mono text-xs"
            placeholder={`${miners[0]?.slug},${miners[0]?.refPrice},In stock,0,US\n${miners[1]?.slug},${miners[1]?.refPrice},Pre-order,150,HK`}
          />
          <div className="flex items-center gap-3">
            <button type="button" onClick={runImport} disabled={!csv.trim()} className="btn-primary px-4 py-2 text-xs disabled:opacity-60">
              Import
            </button>
            {csvResult ? <span className="text-xs text-muted">{csvResult}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 font-semibold">Price $</th>
              <th className="px-4 py-3 font-semibold">Shipping $</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              <th className="px-4 py-3 font-semibold">Ships from</th>
              <th className="px-4 py-3 font-semibold">PSU</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => {
              const saved = offers.find((offer) => offer._id === draft.offerId);
              const dirty =
                !saved ||
                saved.minerSlug !== draft.minerSlug ||
                String(saved.price) !== draft.price ||
                String(saved.shipping) !== draft.shipping ||
                saved.availability !== draft.availability ||
                saved.condition !== draft.condition ||
                saved.shipsFrom !== draft.shipsFrom ||
                saved.psuIncluded !== draft.psuIncluded;
              return (
                <tr key={draft.key} className="border-b border-line/60 align-top last:border-0">
                  <td className="px-4 py-2.5">
                    <select value={draft.minerSlug} onChange={(event) => edit(draft.key, { minerSlug: event.target.value })} className="input py-2 text-xs" aria-label="Model">
                      {miners.map((miner) => (
                        <option key={miner.slug} value={miner.slug} className="bg-[#0b1016]">
                          {miner.label}
                        </option>
                      ))}
                      {!minerMap.has(draft.minerSlug) ? <option value={draft.minerSlug}>{draft.minerSlug} (retired)</option> : null}
                    </select>
                    {rowError[draft.key] ? <p className="mt-1 text-[11px] text-red-300">{rowError[draft.key]}</p> : null}
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" min={1} value={draft.price} onChange={(event) => edit(draft.key, { price: event.target.value })} className="input w-24 py-2 text-xs tabular-nums" aria-label="Price" />
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="number" min={0} value={draft.shipping} onChange={(event) => edit(draft.key, { shipping: event.target.value })} className="input w-20 py-2 text-xs tabular-nums" aria-label="Shipping" />
                  </td>
                  <td className="px-4 py-2.5">
                    <select value={draft.availability} onChange={(event) => edit(draft.key, { availability: event.target.value as Stock })} className="input py-2 text-xs" aria-label="Stock">
                      {(["In stock", "Pre-order", "Out of stock"] as const).map((value) => (
                        <option key={value} className="bg-[#0b1016]">
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select value={draft.condition} onChange={(event) => edit(draft.key, { condition: event.target.value as Condition })} className="input py-2 text-xs" aria-label="Condition">
                      {(["New", "Refurbished"] as const).map((value) => (
                        <option key={value} className="bg-[#0b1016]">
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <select value={draft.shipsFrom} onChange={(event) => edit(draft.key, { shipsFrom: event.target.value })} className="input w-24 py-2 text-xs" aria-label="Ships from">
                      {COUNTRIES.map(([code]) => (
                        <option key={code} value={code} className="bg-[#0b1016]">
                          {code}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={draft.psuIncluded} onChange={(event) => edit(draft.key, { psuIncluded: event.target.checked })} className="mt-2 h-4 w-4 accent-[#b9ff66]" aria-label="PSU included" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={!dirty || savingKey === draft.key}
                      onClick={() => save(draft)}
                      className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      {savingKey === draft.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {draft.offerId ? "Save" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!draft.offerId) {
                          setDrafts((current) => current.filter((item) => item.key !== draft.key));
                          return;
                        }
                        if (window.confirm("Delete this listing?")) {
                          await deleteOffer({ offerId: draft.offerId });
                          refreshPublic(["/", "/miners", `/miners/${draft.minerSlug}`, "/vendors", `/vendors/${vendorSlug}`]);
                        }
                      }}
                      className="ml-1 inline-grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/[0.06] hover:text-red-300"
                      aria-label="Delete listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {drafts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
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
