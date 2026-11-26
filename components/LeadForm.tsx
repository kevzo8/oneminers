"use client";

import { useState } from "react";
import { Check, Clock, Mail, Send } from "lucide-react";
import SearchSelect from "./directory/SearchSelect";

type State = "idle" | "sending" | "sent" | "error";

export default function LeadForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", interest: "Buying miners", message: "" });

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
              <div className="chip text-accent">Talk to the team</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Buying, hosting or selling? <span className="text-gradient">Let's talk.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Tell us which miners you're looking at, how many, and whether you want them hosted. We'll come back with prices,
                availability and a hosting quote.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-line bg-panel-soft px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet/10">
                    <Clock className="h-4 w-4 text-violet-300" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Response</div>
                    <div className="text-sm font-semibold text-ink">Usually within one business day</div>
                  </div>
                </div>
                <a href="/sell" className="flex items-center gap-3 rounded-xl border border-line bg-panel-soft px-4 py-3 transition-colors hover:border-accent/30">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10">
                    <Mail className="h-4 w-4 text-accent" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Selling miners?</div>
                    <div className="text-sm font-semibold text-ink">List your company free during the launch promo</div>
                  </div>
                </a>
              </div>
            </div>

            {state === "sent" ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.06] p-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/15">
                  <Check className="h-6 w-6 text-accent" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-ink">Request received.</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  Thanks, {form.name.split(" ")[0] || "there"}. We'll reply within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setForm({ name: "", email: "", interest: "Buying miners", message: "" });
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
                  <SearchSelect<string>
                    value={form.interest}
                    options={["Buying miners", "Hosting", "Buying and hosting", "Selling on the directory", "Something else"]}
                    onChange={(interest) => setForm({ ...form, interest })}
                    label="Interest"
                    className="w-full"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                    Models, quantity and notes
                  </span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="input resize-none"
                    placeholder="e.g. 20× Antminer S21 XP Hyd, hosted in Texas or Norway"
                  />
                </label>

                {state === "error" ? <p className="text-xs text-red-300">{error}</p> : null}

                <button type="submit" disabled={state === "sending"} className="btn-primary mt-1 px-5 py-3 text-sm disabled:opacity-60">
                  {state === "sending" ? "Sending..." : "Send request"}
                  <Send className="h-4 w-4" />
                </button>
                <p className="text-[10px] leading-relaxed text-muted/70">
                  We use your details only to answer your request. We never sell your data.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
