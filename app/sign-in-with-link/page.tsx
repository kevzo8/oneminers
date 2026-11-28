import type { Metadata } from "next";
import { Suspense } from "react";
import ConvexAuthClient from "@/components/portal/ConvexAuthClient";
import SignInWithLink from "@/components/portal/SignInWithLink";

export const metadata: Metadata = {
  title: "Sign in with email link",
  description: "Complete your MinerPicks email sign-in.",
  robots: { index: false },
};

export default function SignInWithLinkPage() {
  return (
    <ConvexAuthClient>
      <Suspense fallback={<p className="py-24 text-center text-sm text-muted">Loading…</p>}>
        <SignInWithLink />
      </Suspense>
    </ConvexAuthClient>
  );
}
