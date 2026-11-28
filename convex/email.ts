import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { env, type MutationCtx } from "./_generated/server";

export const resend = new Resend(components.resend, {
  testMode: env.RESEND_TEST_MODE !== "false",
});

type EmailArgs = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string[];
  idempotencyKey?: string;
};

export async function queueEmail(ctx: MutationCtx, args: EmailArgs) {
  try {
    return await resend.sendEmail(ctx, {
      from: `${env.SENDER_NAME ?? "MinerPicks"} <${env.SENDER_EMAIL}>`,
      ...args,
    });
  } catch (error) {
    console.warn("[email] skipped send", error);
    return null;
  }
}

export async function notifyNewLead(
  ctx: MutationCtx,
  lead: { name: string; email: string; interest: string; message?: string }
) {
  const to = env.NOTIFY_EMAIL ?? env.SENDER_EMAIL;
  return queueEmail(ctx, {
    to,
    replyTo: [lead.email],
    subject: `New MinerPicks enquiry: ${lead.interest}`,
    text: [`Name: ${lead.name}`, `Email: ${lead.email}`, `Interest: ${lead.interest}`, "", lead.message ?? ""].join("\n"),
    html: `<div style="font-family:Arial,sans-serif;color:#111827"><h2>New enquiry</h2><p><strong>Name:</strong> ${escapeHtml(lead.name)}</p><p><strong>Email:</strong> ${escapeHtml(lead.email)}</p><p><strong>Interest:</strong> ${escapeHtml(lead.interest)}</p><p>${escapeHtml(lead.message ?? "").replace(/\n/g, "<br>")}</p></div>`,
    idempotencyKey: `lead:${lead.email}:${lead.interest}:${Date.now()}`,
  });
}

export async function acknowledgeLead(
  ctx: MutationCtx,
  lead: { name: string; email: string; interest: string }
) {
  const siteUrl = env.SITE_URL ?? "http://localhost:3000";
  const unsubscribe = `${siteUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}`;
  return queueEmail(ctx, {
    to: lead.email,
    subject: "We received your MinerPicks enquiry",
    text: `Hi ${lead.name},\n\nThanks for getting in touch about ${lead.interest}. We'll reply shortly.\n\nUnsubscribe: ${unsubscribe}`,
    html: `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Thanks, ${escapeHtml(lead.name)}</h2><p>We received your ${escapeHtml(lead.interest)} enquiry and will reply shortly.</p><p style="font-size:12px;color:#55606b"><a href="${unsubscribe}">Unsubscribe</a></p></div>`,
    idempotencyKey: `lead-ack:${lead.email}:${lead.interest}:${Date.now()}`,
  });
}

export async function notifyVendorStatus(
  ctx: MutationCtx,
  vendor: { name: string; contactEmail?: string; status: string }
) {
  if (!vendor.contactEmail) return null;
  return queueEmail(ctx, {
    to: vendor.contactEmail,
    subject: `MinerPicks vendor review: ${vendor.status}`,
    text: `Hi,\n\nYour MinerPicks vendor profile (${vendor.name}) is now ${vendor.status}.\n\nMinerPicks`,
    html: `<div style="font-family:Arial,sans-serif;color:#111827"><h2>Vendor review update</h2><p>${escapeHtml(vendor.name)} is now <strong>${escapeHtml(vendor.status)}</strong>.</p></div>`,
    idempotencyKey: `vendor-status:${vendor.name}:${vendor.status}:${Date.now()}`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}
