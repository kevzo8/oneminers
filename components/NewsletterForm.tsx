"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Newsletter subscriber", email, interest: "Newsletter" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Couldn't subscribe.");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't subscribe.");
    }
  }

  if (state === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-xs text-accent">
        <Check className="h-4 w-4" /> You&apos;re subscribed. Unsubscribe any time from any email.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <div className="flex max-w-sm gap-2">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input py-2 text-xs" aria-label="Email for the newsletter" />
        <button type="submit" disabled={state === "sending"} className="btn-primary shrink-0 px-4 text-xs disabled:opacity-60">
          {state === "sending" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Subscribe"}
        </button>
      </div>
      {state === "error" ? <p className="text-sm text-red-300">{error}</p> : <p className="text-xs text-muted/70">New miners, price drops and profitability changes. No spam.</p>}
    </form>
  );
}
