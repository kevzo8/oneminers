"use client";

import { useState } from "react";
import { Check, Clock, Mail, MessageSquare, Send } from "lucide-react";

type State = "idle" | "sending" | "sent" | "error";

export default function LeadForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", interest: "For sale", message: "" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not send the request.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not send the request.");
    }
  }

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="surface-strong relative overflow-hidden rounded-[1.75rem] p-6 sm:p-10">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-aqua/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <div className="chip text-accent">Contact the desk</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Tell us what you need to <span className="text-gradient">power.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Share your target capacity, country preference, and power budget. The desk will match
                you with the closest live inventory and send the full package.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10">
                    <Mail className="h-4 w-4 text-accent" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Email</div>
                    <div className="text-sm font-semibold text-ink">hello@oneminers.example</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-aqua/10">
                    <MessageSquare className="h-4 w-4 text-aqua" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Telegram desk</div>
                    <div className="text-sm font-semibold text-ink">@oneminers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet/10">
                    <Clock className="h-4 w-4 text-violet-300" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Response</div>
                    <div className="text-sm font-semibold text-ink">Usually within one business day</div>
                  </div>
                </div>
              </div>
            </div>

            {state === "sent" ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.06] p-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/15">
                  <Check className="h-6 w-6 text-accent" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-ink">Request received.</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  Thanks, {form.name.split(" ")[0] || "there"}. The desk will follow up with matching
                  capacity and the full package.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setForm({ name: "", email: "", interest: "For sale", message: "" });
                  }}
                  className="btn-ghost mt-6 px-4 py-2 text-xs"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Name</span>
                    <input
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="input"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Email</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="input"
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Interested in</span>
                  <select
                    value={form.interest}
                    onChange={(event) => setForm({ ...form, interest: event.target.value })}
                    className="input"
                  >
                    <option>For sale</option>
                    <option>For lease</option>
                    <option>Hosting</option>
                    <option>List my site</option>
                    <option>General</option>
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                    Target capacity / notes
                  </span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="input resize-none"
                    placeholder="e.g. 10-20 MW, Paraguay or Philippines, energized preferred"
                  />
                </label>

                {state === "error" ? <p className="text-xs text-red-300">{error}</p> : null}

                <button type="submit" disabled={state === "sending"} className="btn-primary mt-1 px-5 py-3 text-sm disabled:opacity-60">
                  {state === "sending" ? "Sending..." : "Request the package"}
                  <Send className="h-4 w-4" />
                </button>
                <p className="text-[10px] leading-relaxed text-muted/70">
                  Demo form. Submissions are acknowledged locally and can be forwarded to a webhook.
                  No data is sold.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
