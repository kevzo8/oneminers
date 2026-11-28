"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Download, Loader2, Plus, Save, Search, ShieldAlert, Trash2, Upload, XCircle } from "lucide-react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { Algorithm, HashUnit } from "@/lib/economics";
import type { Category, Cooling } from "@/lib/catalog";
import SignInPanel from "./SignInPanel";
import SearchSelect from "../directory/SearchSelect";
import { downloadCsv, parseCsv, toCsv } from "@/lib/csv";

type Tier = "Gold" | "Silver" | "Bronze" | "Free";
type Status = "pending" | "approved" | "rejected";
type VendorRowData = Doc<"vendors"> & { offerCount: number };
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="px-4 py-3 font-semibold">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.1em] hover:text-ink ${active ? "text-ink" : ""}`}
      >
        {label}
        <Icon className={`h-3 w-3 ${active ? "text-accent" : "opacity-40"}`} aria-hidden="true" />
      </button>
    </th>
  );
}

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

      <VendorsSection vendors={data.vendors} />

      <LeadsSection />

      <MinersSection miners={data.miners} />
    </div>
  );
}

function LeadsSection() {
  const leads = useQuery(api.leads.listForAdmin);
  const removeLead = useMutation(api.leads.removeForAdmin);
  const [query, setQuery] = useState("");
  if (leads === undefined) return <Spinner />;

  const rows = leads
    .filter((lead) => {
      const q = query.trim().toLowerCase();
      return !q || [lead.name, lead.email, lead.interest, lead.message ?? ""].join(" ").toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  function exportLeads() {
    const columns = ["name", "email", "interest", "message", "source", "createdAt"];
    downloadCsv(`minerpicks-leads-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows as unknown as Record<string, unknown>[], columns));
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-ink">Email leads</h2>
          <p className="text-sm text-muted">{rows.length} of {leads.length} messages</p>
        </div>
        <button type="button" onClick={exportLeads} className="btn-ghost px-3 py-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>
      <div className="surface rounded-2xl p-3">
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, interest or message…"
            className="input"
            style={{ paddingLeft: "2.25rem" }}
            aria-label="Search leads"
          />
        </label>
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Interest</th>
              <th className="px-4 py-3 font-semibold">Message</th>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead._id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 text-sm text-ink">{lead.name}</td>
                <td className="px-4 py-3 text-xs text-muted">{lead.email}</td>
                <td className="px-4 py-3 text-xs text-muted">{lead.interest}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-muted">{lead.message ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(lead.createdAt).toLocaleString("en-US")}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Delete the lead from ${lead.email}?`)) await removeLead({ id: lead._id });
                    }}
                    className="text-xs font-semibold text-red-300 hover:text-red-200"
                  >
                    Delete
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

function VendorsSection({ vendors }: { vendors: VendorRowData[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "All">("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [listed, setListed] = useState<"All" | "Yes" | "No">("All");
  const [sort, setSort] = useState<{ key: "name" | "offers" | "status" | "tier"; dir: SortDir }>({ key: "status", dir: "asc" });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = vendors.filter((vendor) => {
      const haystack = [vendor.name, vendor.website, vendor.countryCode, vendor.contactEmail ?? "", vendor.about ?? "", vendor.status, vendor.tier, vendor.partnerLinkStatus ?? ""].join(" ").toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (status === "All" || vendor.status === status) &&
        (tier === "All" || vendor.tier === tier) &&
        (listed === "All" || (listed === "Yes" ? vendor.offerCount > 0 : vendor.offerCount === 0))
      );
    });
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "offers") return (a.offerCount - b.offerCount) * direction;
      return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * direction;
    });
  }, [vendors, query, status, tier, listed, sort]);

  function toggleSort(key: typeof sort.key) {
    setSort((current) => (current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function exportVendors() {
    const columns = [
      "name",
      "website",
      "countryCode",
      "contactEmail",
      "status",
      "tier",
      "verified",
      "offerCount",
      "partnerLinkStatus",
      "partnerLinkUrl",
      "payments",
      "warrantyMonths",
      "about",
      "sample",
    ];
    downloadCsv(`minerpicks-vendors-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows as unknown as Record<string, unknown>[], columns));
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Vendors</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            {rows.length} of {vendors.length}
          </span>
          <button type="button" onClick={exportVendors} className="btn-ghost px-3 py-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>
      <div className="surface flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, website, country, email, notes…"
            className="input"
            style={{ paddingLeft: "2.25rem" }}
            aria-label="Search vendors"
          />
        </label>
        <SearchSelect
          value={status}
          options={[
            { value: "All", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
          onChange={setStatus}
          label="Status"
          className="w-36"
        />
        <SearchSelect
          value={tier}
          options={[
            { value: "All", label: "All tiers" },
            { value: "Gold", label: "Gold" },
            { value: "Silver", label: "Silver" },
            { value: "Bronze", label: "Bronze" },
            { value: "Free", label: "Free" },
          ]}
          onChange={setTier}
          label="Tier"
          className="w-32"
        />
        <SearchSelect
          value={listed}
          options={[
            { value: "All", label: "Any listings" },
            { value: "Yes", label: "Listed" },
            { value: "No", label: "No listings" },
          ]}
          onChange={setListed}
          label="Listings"
          className="w-36"
        />
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[1000px] text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <SortHeader label="Vendor" active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")} />
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Partner link</th>
              <SortHeader label="Offers" active={sort.key === "offers"} dir={sort.dir} onClick={() => toggleSort("offers")} />
              <SortHeader label="Status" active={sort.key === "status"} dir={sort.dir} onClick={() => toggleSort("status")} />
              <SortHeader label="Tier" active={sort.key === "tier"} dir={sort.dir} onClick={() => toggleSort("tier")} />
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((vendor) => (
              <VendorRow key={vendor._id} vendor={vendor} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VendorRow({ vendor }: { vendor: VendorRowData }) {
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
          {vendor.name} {vendor.sample ? <span className="ml-1 text-xs font-bold text-muted">SAMPLE</span> : null}
        </div>
        <div className="text-sm text-muted">
          {vendor.countryCode} ·{" "}
          {vendor.website.startsWith("http") ? (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              {vendor.website.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            "no website"
          )}
        </div>
        {vendor.about ? <div className="mt-1 max-w-xs text-sm text-muted/80">{vendor.about}</div> : null}
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
        <SearchSelect
          value={status}
          options={["pending", "approved", "rejected"] as const}
          onChange={(value) => setStatus(value as Status)}
          label="Review status"
          className="w-28"
        />
      </td>
      <td className="px-4 py-3">
        <SearchSelect
          value={tier}
          options={["Free", "Bronze", "Silver", "Gold"] as const}
          onChange={(value) => setTier(value as Tier)}
          label="Tier"
          className="w-24"
        />
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
  const importMiners = useMutation(api.admin.importMiners);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_MINER);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [algorithm, setAlgorithm] = useState("All");
  const [cooling, setCooling] = useState("All");
  const [category, setCategory] = useState("All");
  const [unit, setUnit] = useState("All");
  const [listed, setListed] = useState<"All" | "Yes" | "No">("All");
  const [sort, setSort] = useState<{ key: "name" | "algorithm" | "hashrate" | "power" | "listed"; dir: SortDir }>({ key: "name", dir: "asc" });

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
    <div className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <SearchSelect<string>
        value={String(form[key])}
        options={options}
        onChange={(value) => setForm({ ...form, [key]: value })}
        label={label}
        className="mt-1 w-full"
      />
    </div>
  );
  const text = (key: keyof typeof EMPTY_MINER, label: string, type = "text") => (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <input type={type} required={key !== "slug" && key !== "refPrice"} value={String(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="input mt-1 py-2 text-sm" />
    </label>
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = miners.filter((miner) => {
      const haystack = [miner.manufacturer, miner.model, miner.slug, miner.algorithm, miner.unit, miner.cooling, miner.category].join(" ").toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (algorithm === "All" || miner.algorithm === algorithm) &&
        (cooling === "All" || miner.cooling === cooling) &&
        (category === "All" || miner.category === category) &&
        (unit === "All" || miner.unit === unit) &&
        (listed === "All" || (listed === "Yes" ? miner.active : !miner.active))
      );
    });
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "hashrate") return (a.hashrate - b.hashrate) * direction;
      if (sort.key === "power") return (a.powerW - b.powerW) * direction;
      if (sort.key === "listed") return (Number(a.active) - Number(b.active)) * direction;
      if (sort.key === "algorithm") return a.algorithm.localeCompare(b.algorithm) * direction;
      return `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`) * direction;
    });
  }, [miners, query, algorithm, cooling, category, unit, listed, sort]);

  function toggleSort(key: typeof sort.key) {
    setSort((current) => (current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function exportMiners() {
    const columns = ["slug", "manufacturer", "model", "algorithm", "hashrate", "unit", "powerW", "cooling", "category", "release", "refPrice", "active"];
    downloadCsv(`minerpicks-miners-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows as unknown as Record<string, unknown>[], columns));
  }

  async function importModels(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError("");
    try {
      const parsed = parseCsv(await file.text());
      const payload: {
        slug: string;
        manufacturer: string;
        model: string;
        algorithm: Algorithm;
        hashrate: number;
        unit: HashUnit;
        powerW: number;
        cooling: Cooling;
        category: Category;
        release: number;
        refPrice: number;
        active: boolean;
      }[] = parsed.map((row) => ({
        slug: (row.slug ?? "").trim(),
        manufacturer: (row.manufacturer ?? "").trim(),
        model: (row.model ?? "").trim(),
        algorithm: (row.algorithm || "SHA-256") as Algorithm,
        hashrate: Number(row.hashrate),
        unit: (row.unit || "TH/s") as HashUnit,
        powerW: Number(row.powerW),
        cooling: (row.cooling || "Air") as Cooling,
        category: (row.category || "Industrial") as Category,
        release: Number(row.release) || new Date().getFullYear(),
        refPrice: Number(row.refPrice) || 0,
        active: row.active == null ? true : String(row.active).toLowerCase() === "true",
      }));
      if (!payload.length) throw new Error("No data rows found in the CSV.");
      const result = await importMiners({ miners: payload });
      setError(`Imported ${result.total} models: ${result.created} created, ${result.updated} updated.`);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section id="miner-form">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Miner catalog</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportMiners} className="btn-ghost px-3 py-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Export models
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={importing} className="btn-ghost px-3 py-2 text-xs disabled:opacity-50">
            <Upload className="h-3.5 w-3.5" /> {importing ? "Importing…" : "Import models"}
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importModels} className="hidden" aria-label="Import models CSV" />
          <button type="button" onClick={() => { setForm(EMPTY_MINER); setOpen((value) => !value); }} className="btn-primary px-4 py-2 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add miner
          </button>
        </div>
      </div>
      {error ? <p className="mb-3 text-xs text-muted">{error}</p> : null}
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
      <div className="surface flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search manufacturer, model, slug, algo…"
            className="input"
            style={{ paddingLeft: "2.25rem" }}
            aria-label="Search miners"
          />
        </label>
        <SearchSelect
          value={algorithm}
          options={[
            { value: "All", label: "All algorithms" },
            "SHA-256",
            "Scrypt",
            "kHeavyHash",
            "Equihash",
            "Etchash",
            "X11",
            "Eaglesong",
          ]}
          onChange={setAlgorithm}
          label="Algorithm"
          className="w-36"
        />
        <SearchSelect
          value={cooling}
          options={[{ value: "All", label: "All cooling" }, "Air", "Hydro", "Immersion"]}
          onChange={setCooling}
          label="Cooling"
          className="w-32"
        />
        <SearchSelect
          value={category}
          options={[{ value: "All", label: "All types" }, "Industrial", "Home"]}
          onChange={setCategory}
          label="Type"
          className="w-32"
        />
        <SearchSelect
          value={unit}
          options={[{ value: "All", label: "All units" }, "TH/s", "GH/s", "MH/s", "kSol/s"]}
          onChange={setUnit}
          label="Unit"
          className="w-32"
        />
        <SearchSelect
          value={listed}
          options={[
            { value: "All", label: "Any status" },
            { value: "Yes", label: "Listed" },
            { value: "No", label: "Hidden" },
          ]}
          onChange={setListed}
          label="Listing status"
          className="w-32"
        />
        <span className="ml-auto text-sm text-muted">
          {rows.length} of {miners.length}
        </span>
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
              <SortHeader label="Miner" active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")} />
              <SortHeader label="Algorithm" active={sort.key === "algorithm"} dir={sort.dir} onClick={() => toggleSort("algorithm")} />
              <SortHeader label="Hashrate" active={sort.key === "hashrate"} dir={sort.dir} onClick={() => toggleSort("hashrate")} />
              <SortHeader label="Power" active={sort.key === "power"} dir={sort.dir} onClick={() => toggleSort("power")} />
              <SortHeader label="Listed" active={sort.key === "listed"} dir={sort.dir} onClick={() => toggleSort("listed")} />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((miner) => (
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
