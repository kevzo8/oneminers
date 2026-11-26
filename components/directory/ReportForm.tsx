"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import SearchSelect from "./SearchSelect";

const REASONS = ["Report wrong data", "Report a bug", "Suggest a miner or feature", "Other feedback"];

export default function ReportForm({ miners, initialMiner }: { miners: { slug: string; label: string }[]; initialMiner?: string }) {
  const [form, setForm] = useState({ reason: initialMiner ? REASONS[0] : "", email: "", miner: initialMiner ?? "", comments: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    setError("");
    if (!form.reason) {
      setError("Please choose a reason.");
      setState("idle");
      return;
    }
    try {
      const minerLabel = miners.find((m) => m.slug === form.miner)?.label;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Website report",
          email: form.email,
          interest: form.reason,
          message: [minerLabel ? `Miner: ${minerLabel} (${form.miner})` : "", form.comments].filter(Boolean).join("\n"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't send. Try again.");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't send. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="surface rounded-3xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <h2 className="mt-3 text-xl font-bold text-ink">Thanks, we got it.</h2>
        <p className="mt-1 text-sm text-muted">We check every report and reply by email if we need more detail.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 rounded-3xl p-6">
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Reason *</span>
        <SearchSelect<string>
          value={form.reason}
          options={[{ value: "", label: "Please select" }, ...REASONS]}
          onChange={(reason) => setForm({ ...form, reason })}
          label="Reason"
          className="mt-1.5 w-full"
        />
      </label>
      <div className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Miner (optional)</span>
        <SearchSelect
          value={form.miner}
          options={[
            { value: "", label: "Not about a specific miner" },
            ...miners.map((m) => ({ value: m.slug, label: m.label })),
          ]}
          onChange={(value) => setForm({ ...form, miner: value })}
          label="Miner"
          className="mt-1.5 w-full"
        />
      </div>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Your email *</span>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Details</span>
        <textarea rows={4} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} className="input mt-1.5 resize-none" placeholder="What's wrong, and where did you see the correct value?" />
      </label>
      {state === "error" ? <p className="text-xs text-red-300">{error}</p> : null}
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full px-5 py-3 text-sm disabled:opacity-60">
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
      </button>
    </form>
  );
}
