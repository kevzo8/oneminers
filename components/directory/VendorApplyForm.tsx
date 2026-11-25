"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

const EMPTY = { company: "", website: "", country: "", name: "", email: "", models: "", message: "" };

export default function VendorApplyForm() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          interest: "Vendor listing",
          message: [
            `Company: ${form.company}`,
            `Website: ${form.website}`,
            `Country: ${form.country}`,
            `Models in stock: ${form.models}`,
            form.message ? `Notes: ${form.message}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setState("done");
      setForm(EMPTY);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="surface-strong rounded-3xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <h3 className="mt-4 text-xl font-bold text-ink">Application received</h3>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll verify your company and reply within one business day. Meanwhile, explore the seller portal.
        </p>
        <Link href="/vendor-portal" className="btn-primary mt-6 px-5 py-2.5 text-sm">
          Open the seller portal <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const field = (key: keyof typeof EMPTY, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <input
        {...props}
        value={form[key]}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="input mt-1.5"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="surface-strong space-y-4 rounded-3xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-ink">Apply to list</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("company", "Company name", { required: true, placeholder: "Acme Mining Supply Ltd." })}
        {field("website", "Website", { required: true, type: "url", placeholder: "https://" })}
        {field("country", "Country", { required: true, placeholder: "Hong Kong" })}
        {field("models", "Models in stock", { placeholder: "e.g. 25" })}
        {field("name", "Your name", { required: true, minLength: 2 })}
        {field("email", "Work email", { required: true, type: "email" })}
      </div>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Anything else?</span>
        <textarea
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          rows={3}
          className="input mt-1.5 resize-none"
          placeholder="Brands you carry, warehouse locations, hosting…"
        />
      </label>
      {state === "error" ? <p className="text-xs text-red-400">{error}</p> : null}
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full px-5 py-3 text-sm disabled:opacity-60">
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Start my 6 free months
      </button>
      <p className="text-center text-[11px] text-muted/70">No card needed for the free period. Cancel anytime.</p>
    </form>
  );
}
