"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageShell } from "@/components/directory/ui";

export default function UnsubscribeForm({ initialEmail }: { initialEmail: string }) {
  const unsubscribe = useMutation(api.leads.unsubscribe);
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-lg px-5 sm:px-8">
        <div className="surface-strong mt-10 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-ink">Unsubscribe</h1>
          <p className="mt-2 text-sm text-muted">
            We’ll remove your email from leads and stop sending enquiry messages.
          </p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setState("busy");
              try {
                const result = await unsubscribe({ email });
                setMessage(`Done. Removed ${result.removed} record${result.removed === 1 ? "" : "s"}.`);
                setState("done");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not unsubscribe.");
                setState("error");
              }
            }}
            className="mt-6 space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="you@company.com"
            />
            <button type="submit" disabled={state === "busy"} className="btn-primary w-full px-5 py-3 text-sm disabled:opacity-50">
              {state === "busy" ? "Working…" : "Unsubscribe"}
            </button>
          </form>
          {message ? <p className={`mt-3 text-xs ${state === "error" ? "text-red-300" : "text-accent"}`}>{message}</p> : null}
          <Link href="/" className="btn-ghost mt-6 px-5 py-2.5 text-sm">Back to homepage</Link>
        </div>
      </div>
    </PageShell>
  );
}
