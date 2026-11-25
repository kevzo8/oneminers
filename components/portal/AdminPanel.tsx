"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CheckCircle2, Loader2, Plus, Save, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import SignInPanel from "./SignInPanel";

type Tier = "Gold" | "Silver" | "Bronze" | "Free";
type Status = "pending" | "approved" | "rejected";

function errorText(err: unknown) {
  if (err instanceof ConvexError) return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  const message = err instanceof Error ? err.message : String(err);
  return message.replace(/^\[.*?\]\s*/, "").replace(/^Uncaught Error:\s*/, "").split("\n")[0].replace(/\s+at .*$/, "");
}

export default function AdminPanel() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <SignInPanel intro={<h1 className="text-3xl font-bold text-ink">Admin sign in</h1>} />;
  return <AdminGate />;
}

function Spinner() {
  return (
    <div className="grid place-items-center py-24 text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

function AdminGate() {
  const me = useQuery(api.users.me);
  if (me === undefined) return <Spinner />;
  if (me?.role !== "admin") {
    return (
      <div className="surface mx-auto max-w-lg rounded-3xl p-8 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-amber" />
        <h1 className="mt-3 text-xl font-bold text-ink">Admins only</h1>
        <p className="mt-2 text-sm text-muted">
          This account isn&apos;t an admin. An existing admin can grant access from the command line with your account ID
          {me ? <code className="mt-2 block text-xs text-aqua">{me._id}</code> : null}
        </p>
        <Link href="/vendor-portal" className="btn-ghost mt-5 px-4 py-2 text-xs">
          Go to the seller portal
        </Link>
      </div>
    );
  }
  return <Admin />;
}

function Admin() {
  const data = useQuery(api.admin.overview);
  const deleteSamples = useMutation(api.admin.deleteSampleVendors);
  if (data === undefined) return <Spinner />;

  const pending = data.vendors.filter((vendor) => vendor.status === "pending");
  const samples = data.vendors.filter((vendor) => vendor.sample).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="chip text-accent">Admin</div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Directory admin</h1>
          <p className="text-xs text-muted">
            {data.vendors.length} vendors · {pending.length} awaiting review · {data.miners.length} miners · last market snapshot{" "}
            {data.lastSnapshotAt ? new Date(data.lastSnapshotAt).toLocaleString("en-US") : "not yet taken"}
          </p>
        </div>
        {samples ? (
          <button
            type="button"
            onClick={async () => {
              if (window.confirm(`Delete the ${samples} sample vendors and all their offers? Real sellers are not affected.`)) {
                await deleteSamples({});
              }
            }}
            className="btn-ghost px-4 py-2 text-xs text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove {samples} sample vendors
          </button>
        ) : null}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Vendors</h2>
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Partner link</th>
                <th className="px-4 py-3 font-semibold">Offers</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {[...pending, ...data.vendors.filter((vendor) => vendor.status !== "pending")].map((vendor) => (
                <VendorRow key={vendor._id} vendor={vendor} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MinersSection miners={data.miners} />
    </div>
  );
}

function VendorRow({ vendor }: { vendor: Doc<"vendors"> & { offerCount: number } }) {
  const setReview = useMutation(api.admin.setVendorReview);
  const [status, setStatus] = useState<Status>(vendor.status);
  const [tier, setTier] = useState<Tier>(vendor.tier);
  const [verified, setVerified] = useState(vendor.verified);
  const [busy, setBusy] = useState(false);
  const dirty = status !== vendor.status || tier !== vendor.tier || verified !== vendor.verified;

  return (
    <tr className="border-b border-line/60 align-top last:border-0">
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-ink">
          {vendor.name} {vendor.sample ? <span className="ml-1 text-[10px] font-bold text-muted">SAMPLE</span> : null}
        </div>
        <div className="text-[11px] text-muted">
          {vendor.countryCode} ·{" "}
          {vendor.website.startsWith("http") ? (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              {vendor.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            "no website"
          )}
        </div>
        {vendor.about ? <div className="mt-1 max-w-xs text-[11px] text-muted/80">{vendor.about}</div> : null}
      </td>
      <td className="px-4 py-3 text-xs text-muted">{vendor.contactEmail ?? (vendor.ownerId ? "—" : "team")}</td>
      <td className="px-4 py-3 text-xs">
        {!vendor.ownerId ? (
          <span className="text-muted">n/a</span>
        ) : vendor.partnerLinkStatus === "found" ? (
          <span className="inline-flex items-center gap-1 text-accent">
            <CheckCircle2 className="h-3.5 w-3.5" /> found{vendor.partnerLinkNofollow ? " (nofollow)" : ""}
          </span>
        ) : vendor.partnerLinkStatus ? (
          <span className="inline-flex items-center gap-1 text-red-300">
            <XCircle className="h-3.5 w-3.5" /> {vendor.partnerLinkStatus}
          </span>
        ) : (
          <span className="text-muted">not checked</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs tabular-nums text-ink">{vendor.offerCount}</td>
      <td className="px-4 py-3">
        <select value={status} onChange={(event) => setStatus(event.target.value as Status)} className="input py-1.5 text-xs">
          {(["pending", "approved", "rejected"] as const).map((value) => (
            <option key={value} className="bg-[#0b1016]">
              {value}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select value={tier} onChange={(event) => setTier(event.target.value as Tier)} className="input py-1.5 text-xs">
          {(["Free", "Bronze", "Silver", "Gold"] as const).map((value) => (
            <option key={value} className="bg-[#0b1016]">
              {value}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="mt-2 h-4 w-4 accent-[#b9ff66]" aria-label="Verified" />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await setReview({ vendorId: vendor._id, status, tier, verified });
            } finally {
              setBusy(false);
            }
          }}
          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </button>
      </td>
    </tr>
  );
}

const EMPTY_MINER = {
  slug: "",
  manufacturer: "",
  model: "",
  algorithm: "SHA-256",
  hashrate: "",
  unit: "TH/s",
  powerW: "",
  cooling: "Air",
  category: "Industrial",
  release: String(new Date().getFullYear()),
  refPrice: "",
  active: true,
};

function MinersSection({ miners }: { miners: Doc<"miners">[] }) {
  const upsertMiner = useMutation(api.admin.upsertMiner);
  const [form, setForm] = useState(EMPTY_MINER);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function editMiner(miner: Doc<"miners">) {
    setForm({ ...miner, hashrate: String(miner.hashrate), powerW: String(miner.powerW), release: String(miner.release), refPrice: String(miner.refPrice) });
    setOpen(true);
    setError("");
    window.scrollTo({ top: document.getElementById("miner-form")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const slug =
      form.slug ||
      `${form.manufacturer}-${form.model}-${form.hashrate}${form.unit.replace("/s", "")}`
        .toLowerCase()
        .replace(/\+/g, "-plus")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    try {
      await upsertMiner({
        slug,
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        algorithm: form.algorithm as Doc<"miners">["algorithm"],
        hashrate: Number(form.hashrate),
        unit: form.unit as Doc<"miners">["unit"],
        powerW: Number(form.powerW),
        cooling: form.cooling as Doc<"miners">["cooling"],
        category: form.category as Doc<"miners">["category"],
        release: Number(form.release),
        refPrice: Number(form.refPrice) || 0,
        active: form.active,
      });
      setForm(EMPTY_MINER);
      setOpen(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const select = (key: keyof typeof EMPTY_MINER, label: string, options: string[]) => (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <select value={String(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="input mt-1 py-2 text-sm">
        {options.map((option) => (
          <option key={option} className="bg-[#0b1016]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
  const text = (key: keyof typeof EMPTY_MINER, label: string, type = "text") => (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <input type={type} required={key !== "slug" && key !== "refPrice"} value={String(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="input mt-1 py-2 text-sm" />
    </label>
  );

  return (
    <section id="miner-form">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Miner catalog</h2>
        <button type="button" onClick={() => { setForm(EMPTY_MINER); setOpen((value) => !value); }} className="btn-primary px-4 py-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add miner
        </button>
      </div>
      {open ? (
        <form onSubmit={save} className="surface mb-4 grid gap-3 rounded-2xl p-5 sm:grid-cols-3 lg:grid-cols-6">
          {text("manufacturer", "Manufacturer")}
          {text("model", "Model")}
          {select("algorithm", "Algorithm", ["SHA-256", "Scrypt", "kHeavyHash", "Equihash", "Etchash", "X11", "Eaglesong"])}
          {text("hashrate", "Hashrate", "number")}
          {select("unit", "Unit", ["TH/s", "GH/s", "MH/s", "kSol/s"])}
          {text("powerW", "Power (W)", "number")}
          {select("cooling", "Cooling", ["Air", "Hydro", "Immersion"])}
          {select("category", "Type", ["Industrial", "Home"])}
          {text("release", "Release year", "number")}
          {text("refPrice", "Reference price $", "number")}
          {text("slug", "Slug (auto if empty)")}
          <label className="flex items-end gap-2 pb-2 text-sm text-muted">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-[#b9ff66]" />
            Listed
          </label>
          <div className="flex items-center gap-3 sm:col-span-3 lg:col-span-6">
            <button type="submit" disabled={busy} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save miner
            </button>
            {error ? <span className="text-xs text-red-300">{error}</span> : null}
          </div>
        </form>
      ) : null}
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-semibold">Miner</th>
              <th className="px-4 py-3 font-semibold">Algorithm</th>
              <th className="px-4 py-3 font-semibold">Hashrate</th>
              <th className="px-4 py-3 font-semibold">Power</th>
              <th className="px-4 py-3 font-semibold">Listed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {miners.map((miner) => (
              <tr key={miner._id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-2.5 text-sm text-ink">
                  {miner.manufacturer} {miner.model}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{miner.algorithm}</td>
                <td className="px-4 py-2.5 text-xs tabular-nums text-muted">
                  {miner.hashrate} {miner.unit}
                </td>
                <td className="px-4 py-2.5 text-xs tabular-nums text-muted">{miner.powerW} W</td>
                <td className="px-4 py-2.5 text-xs">{miner.active ? <span className="text-accent">Yes</span> : <span className="text-muted">Hidden</span>}</td>
                <td className="px-4 py-2.5 text-right">
                  <button type="button" onClick={() => editMiner(miner)} className="text-xs font-semibold text-aqua hover:text-accent">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
