"use client";

import { ArrowUpRight, BarChart3, Bot, Database, MessageSquareText, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";

const features = [
  {
    icon: Database,
    title: "Answers from live data",
    body: "Uses the same live profitability, prices and hosting rates you see on the site. No generic answers.",
  },
  {
    icon: BarChart3,
    title: "Runs the numbers for you",
    body: "Ask what a model earns, which miner pays back fastest, or what hosting changes. It does the math.",
  },
  {
    icon: MessageSquareText,
    title: "Remembers the conversation",
    body: "Follow-up questions work. Come back later and your chat is still there.",
  },
];

export type AiExample = { question: string; answer: string; followUp: string; followUpAnswer: string };

export default function AiDesk({ example }: { example: AiExample }) {
  return (
    <section id="assistant" className="relative scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="chip text-accent">AI mining assistant</div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Ask in plain words. <span className="text-gradient">Get real numbers.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Not sure where to start? Ask the assistant. It answers from the directory&apos;s live data and links you to the right page.
          </p>

          <div className="mt-6 space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-3 rounded-xl border border-line bg-panel-soft px-4 py-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-ink">{feature.title}</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{feature.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("oneminers:open-chat"))}
            className="btn-primary mt-6 px-5 py-2.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask the assistant
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="surface-strong relative overflow-hidden rounded-[1.5rem] p-4 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-aqua/10 blur-3xl" />
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-accent/10">
                <Bot className="h-3.5 w-3.5 text-accent" />
              </span>
              {BRAND.name} assistant
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live data
            </span>
          </div>

          <div className="space-y-3 pt-4">
            {[
              { role: "user", text: example.question },
              { role: "assistant", text: example.answer },
              { role: "user", text: example.followUp },
              { role: "assistant", text: example.followUpAnswer },
            ].map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[82%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-xs font-medium leading-relaxed text-on-accent"
                      : "max-w-[86%] rounded-2xl rounded-bl-md border border-line bg-panel-soft px-3.5 py-2.5 text-xs leading-relaxed text-ink"
                  }
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("oneminers:open-chat"))}
            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-line bg-panel-soft px-3 py-2.5 text-left hover:border-accent/30"
          >
            <span className="text-[11px] text-muted/70">Ask about miners, prices, hosting…</span>
            <span className="ml-auto grid h-6 w-6 place-items-center rounded-md bg-accent/90">
              <ArrowUpRight className="h-3.5 w-3.5 text-on-accent" />
            </span>
          </button>
          <p className="mt-3 text-center text-[9px] text-muted/60">Example built from today&apos;s live numbers · not investment advice</p>
        </div>
      </div>
    </section>
  );
}
