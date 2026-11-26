import type { Metadata } from "next";
import { BadgeCheck, BarChart3, Check, FileSpreadsheet, Handshake, Link2, MessageSquareQuote, Store } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";

export const metadata: Metadata = {
  title: "List your company: sell ASIC miners to qualified buyers",
  description:
    "Launch promo: list your miners free for 6 months, then we contact you about continuing. No commission and no payment details required. Your listings go live as soon as you add them.",
};

const steps = [
  { icon: Store, title: "Create your account", text: "Add your company details. It takes two minutes." },
  { icon: FileSpreadsheet, title: "Add listings", text: "Add models by hand or paste a CSV. They go live on the miner pages right away." },
  { icon: Link2, title: "Add the partner link", text: "Within 14 days, link to our partner OneMiners from your site. The portal checks it for you." },
  { icon: BadgeCheck, title: "Get verified", text: "We check your company registration and add your Verified badge." },
];

const benefits = [
  { icon: Store, text: "Your offers on every matching miner page" },
  { icon: BadgeCheck, text: "Verified vendor profile with ratings and reply time" },
  { icon: MessageSquareQuote, text: "Quote requests and buyer leads sent straight to you" },
  { icon: BarChart3, text: "Seller portal: views, clicks and leads every month" },
  { icon: Handshake, text: "Partner badge and a backlink from the directory" },
];

const faqs = [
  {
    q: "What does it cost?",
    a: "During the launch promo, listings are free for the first 6 months. After that we contact you about continuing — there are no payment details to provide and no commission on sales. Cancel anytime; your listings simply go offline.",
  },
  {
    q: "Why do you ask for a partner link?",
    a: "The launch promo asks partners to link to OneMiners, our hosting partner, from their website, for example on a partners page. Add it within 14 days of signing up; the seller portal checks it automatically and keeps your listings public."
  },
  {
    q: "Who can list?",
    a: "Registered businesses selling new or refurbished mining hardware, including manufacturers and distributors. Private individuals can't list.",
  },
  {
    q: "Do buyers pay through the directory?",
    a: "No. Buyers contact you or order on your site and pay you directly. The directory never holds money.",
  },
  {
    q: "How is the order of offers decided?",
    a: "By default, offers are sorted by total price. A 'Recommended' view shows paid plans first. A plan never changes your price or the data shown.",
  },
];

const snippet = `<a href="https://oneminers.com/?ref=partner">
  OneMiners: ASIC hosting partner
</a>`;

export default function SellPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-14 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "List your company" }]} />

        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <div className="chip text-accent">Launch promo · 6 months free</div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Put your miners in front of <span className="text-gradient">ready buyers.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              Buyers compare profit, ROI and price here before they buy. Add your stock and it appears on every matching
              miner page right away.
            </p>

            <div className="surface mt-8 rounded-3xl p-6">
              <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">Launch promo · first 6 months</div>
                  <div className="text-4xl font-bold text-accent">Free</div>
                </div>
                <div className="pb-1 text-2xl text-muted">→</div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Then</div>
                  <div className="text-4xl font-bold text-ink">
                    $100<span className="text-base font-medium text-muted">/month</span>
                  </div>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {["No commission on sales", "Cancel anytime", "Listings live immediately", "No payment details required"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-ink">
                    <Check className="h-4 w-4 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit.text} className="flex items-start gap-3 text-sm text-muted">
                  <benefit.icon className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                  {benefit.text}
                </li>
              ))}
            </ul>
          </div>

          <div id="apply" className="lg:sticky lg:top-24">
            <div className="surface-strong rounded-3xl p-6 sm:p-8">
              <div className="chip text-accent">Launch promo</div>
              <h2 className="mt-4 text-2xl font-bold text-ink">List free for 6 months</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Create a seller account, add your company and your miners. Your listings appear on the matching miner pages
                as soon as you save them.
              </p>
              <Link href="/vendor-portal?mode=signup" className="btn-primary mt-6 w-full px-5 py-3 text-sm">
                Create seller account
              </Link>
              <Link href="/vendor-portal?mode=signin" className="btn-ghost mt-2 w-full px-5 py-3 text-sm">
                I already have an account
              </Link>
              <p className="mt-4 text-center text-[11px] text-muted/70">No card needed during the promo. Cancel anytime.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="surface rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <step.icon className="h-5 w-5 text-accent" />
                  <span className="font-mono text-xs text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold text-ink">The partner link</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Add this to your partners or footer section. Your portal shows a green check when the link is live, and
              warns you if it disappears.
            </p>
            <pre className="surface mt-4 overflow-x-auto rounded-2xl p-4 font-mono text-xs leading-relaxed text-aqua">{snippet}</pre>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink">Questions</h2>
            <div className="mt-4 space-y-2">
              {faqs.map((faq) => (
                <details key={faq.q} className="surface rounded-2xl px-4 py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-ink">{faq.q}</summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
