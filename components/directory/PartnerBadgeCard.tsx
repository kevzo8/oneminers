"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { PARTNER } from "@/lib/brand";

export const PARTNER_BADGE_HTML = `<a href="${PARTNER.url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #2a3441;border-radius:999px;background:#0b1016;color:#e8eef5;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none;"><span style="display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#b9ff66;color:#05070a;font-size:11px;font-weight:800;">✓</span>Trusted partner of <strong style="color:#b9ff66;">${PARTNER.name}</strong></a>`;

export function PartnerBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={PARTNER.url}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface-solid px-3.5 py-2 text-[13px] font-semibold text-ink no-underline ${className}`}
    >
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-accent text-[11px] font-black text-on-accent">✓</span>
      Trusted partner of <strong className="text-accent">{PARTNER.name}</strong>
      <ExternalLink className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
    </a>
  );
}

export default function PartnerBadgeCard() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">✓</span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Partner badge</div>
          <h2 className="text-base font-bold text-ink">Show your {PARTNER.name} partnership</h2>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Put this badge on your partners page. It links back to {PARTNER.url} and counts as your partner link.
      </p>

      <div className="mt-4 grid place-items-center rounded-xl border border-line bg-panel-soft px-4 py-6">
        <PartnerBadge />
      </div>

      <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg p-3 text-[10px] leading-relaxed text-aqua">
        {PARTNER_BADGE_HTML}
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(PARTNER_BADGE_HTML);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
        className="btn-ghost mt-3 px-4 py-2 text-xs"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy badge code"}
      </button>
    </div>
  );
}
