"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { useSignInWithEmailMagicLink } from "@convex-dev/auth/methods/email-magic-link/react";
import { api } from "@/convex/_generated/api";
import { PageShell } from "@/components/directory/ui";

const MESSAGES: Record<string, string> = {
  INVALID_CHALLENGE: "This link is no longer valid. Request a new one.",
  INCORRECT_CODE: "This link could not be verified. Request a new one.",
  MISSING_SECRET: "Open the link in the same browser you used to request it.",
  OTHER_ERROR: "Something went wrong. Request a new link.",
};

export default function SignInWithLink() {
  const params = useSearchParams();
  const code = params.get("code");
  const router = useRouter();
  const state = useSignInWithEmailMagicLink(api.auth, { emailCode: code ?? "" });

  useEffect(() => {
    if (state.status === "complete") router.replace("/vendor-portal");
  }, [state.status, router]);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-lg px-5 sm:px-8">
        <div className="surface-strong mt-10 rounded-3xl p-8 text-center">
          {code === null ? (
            <p className="text-sm text-muted">This link is incomplete. Use the link from your email.</p>
          ) : state.status === "loading" ? (
            <>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
              <p className="mt-4 text-sm text-muted">Signing you in…</p>
            </>
          ) : state.status === "complete" ? (
            <>
              <MailCheck className="mx-auto h-8 w-8 text-accent" />
              <p className="mt-4 text-sm text-ink">Signed in. Taking you to the Seller Portal…</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-ink">Link problem</h1>
              <p className="mt-2 text-sm text-muted">{MESSAGES[state.userError.error] ?? MESSAGES.OTHER_ERROR}</p>
            </>
          )}
          <Link href="/vendor-portal?mode=signin" className="btn-ghost mt-6 px-5 py-2.5 text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
