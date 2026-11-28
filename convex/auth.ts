import { setupConvexAuth } from "@convex-dev/auth/server";
import { setupUsernamePassword } from "@convex-dev/auth/methods/username-password/server";
import { setupEmailMagicLink } from "@convex-dev/auth/methods/email-magic-link/server";
import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";

const auth = setupConvexAuth({ component: components.auth });

export const { signOut, refreshSession, isAuthenticated } = auth;

export const { signUpWithUsernamePassword, signInWithUsernamePassword, changePassword } = setupUsernamePassword(auth, {
  component: components.authPassword,
  usernameComponent: components.authUsername,
}).attachUserCallbacks({ createUser: internal.users.createUser });

const siteUrl = env.SITE_URL ?? "http://localhost:3000";
const sender = `${env.SENDER_NAME ?? "MinerPicks"} <${env.SENDER_EMAIL}>`;

export const { sendEmailMagicLink, signInWithEmailMagicLink } = setupEmailMagicLink(auth, {
  component: components.authEmail,
  emailSender: {
    kind: "resend",
    sendEmail: components.resend.lib.sendEmail,
    apiKey: env.RESEND_API_KEY,
    from: sender,
  },
  url: `${siteUrl}/sign-in-with-link`,
}).attachUserCallbacks({ createUser: internal.users.createUserEmailMagicLink });
