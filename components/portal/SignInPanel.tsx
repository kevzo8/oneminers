"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from "@convex-dev/auth/methods/username-password/react";
import { api } from "@/convex/_generated/api";

const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Wrong username or password.",
  USER_NOT_FOUND: "No account with that username. Create one instead?",
  USERNAME_TAKEN: "That username is taken. Try another, or sign in.",
  USERNAME_TOO_SHORT: "Username is too short.",
  USERNAME_TOO_LONG: "Username is too long.",
  USERNAME_HAS_INVALID_CHARACTERS: "Use letters, numbers, dots, dashes or underscores in the username.",
  USERNAME_HAS_SURROUNDING_WHITESPACE: "Remove spaces at the start or end of the username.",
  PASSWORD_TOO_SHORT: "Password must be at least 10 characters.",
  PASSWORD_TOO_LONG: "Password is too long.",
  PASSWORD_TOO_COMMON: "That password is too common. Choose a less predictable one.",
  PASSWORD_HAS_SURROUNDING_WHITESPACE: "Remove spaces at the start or end of the password.",
  RATE_LIMITED: "Too many attempts. Wait a minute and try again.",
  OTHER_ERROR: "Something went wrong. Check your connection and try again.",
};

export default function SignInPanel({
  intro,
  initialMode = "signIn",
}: {
  intro?: React.ReactNode;
  initialMode?: "signIn" | "signUp";
}) {
  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  useEffect(() => setMode(initialMode), [initialMode]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, pending: signingIn } = useSignInWithUsernamePassword(api.auth);
  const { signUp, pending: signingUp } = useSignUpWithUsernamePassword(api.auth);
  const pending = signingIn || signingUp;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = mode === "signIn" ? await signIn({ username, password }) : await signUp({ username, password });
    if (result.status !== "complete") {
      const code = (result as { userError?: { error?: string } }).userError?.error ?? "OTHER_ERROR";
      setError(MESSAGES[code] ?? MESSAGES.OTHER_ERROR);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-center">
      <div>{intro}</div>
      <form onSubmit={submit} className="surface-strong space-y-4 rounded-3xl p-6">
        <div className="inline-flex rounded-full border border-line bg-panel-soft p-1">
          {(["signIn", "signUp"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError("");
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${mode === value ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}
            >
              {value === "signUp" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Username</span>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={pending}
            className="input mt-1.5"
            placeholder="acme-mining"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Password</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            required
            minLength={mode === "signUp" ? 10 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            className="input mt-1.5"
          />
          <span className={`mt-1 block text-[11px] ${mode === "signUp" ? "text-muted/70" : "invisible"}`}>
            At least 10 characters.
          </span>
        </label>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <button type="submit" disabled={pending} className="btn-primary w-full px-5 py-3 text-sm disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signUp" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {mode === "signUp" ? "Create seller account" : "Sign in"}
        </button>
        <p className="text-center text-xs text-muted">
          {mode === "signIn" ? (
            <>
              No account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signUp");
                  setError("");
                }}
                className="font-semibold text-accent hover:underline"
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signIn");
                  setError("");
                }}
                className="font-semibold text-accent hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
