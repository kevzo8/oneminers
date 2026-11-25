import { defineApp } from "convex/server";
import auth from "@convex-dev/auth/convex.config.js";
import authPassword from "@convex-dev/auth/components/password/convex.config.js";
import authUsername from "@convex-dev/auth/components/username/convex.config.js";

const app = defineApp();

// Convex Auth 2: the core (sessions) must be mounted as `auth`; the username + password
// sign-in method uses its own two components.
app.use(auth);
app.use(authPassword);
app.use(authUsername);

export default app;
