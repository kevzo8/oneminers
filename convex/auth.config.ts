import type { AuthConfig } from "convex/server";
import { convexAuthProvider } from "@convex-dev/auth/server";

// Accept the access tokens Convex Auth mints with this deployment's own key.
// Without this file every request looks signed-out, with no error.
export default {
  providers: [convexAuthProvider()],
} satisfies AuthConfig;
