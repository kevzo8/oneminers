"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

/** Convex + Convex Auth for the signed-in areas (seller portal, admin). Tokens live in localStorage. */
export default function ConvexAuthClient({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  });

  if (!client) {
    return <p className="py-20 text-center text-sm text-muted">The database isn&apos;t configured for this deployment.</p>;
  }

  return (
    <ConvexAuthProvider
      client={client}
      api={{
        refreshSession: api.auth.refreshSession,
        signOut: api.auth.signOut,
        isAuthenticated: api.auth.isAuthenticated,
      }}
    >
      {children}
    </ConvexAuthProvider>
  );
}
