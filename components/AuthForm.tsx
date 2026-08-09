"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// One component for both screens, because the two forms are the same shape.
// `mode` decides which Supabase call runs when you press the button.
type Mode = "sign-in" | "sign-up";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  const signingUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const supabase = createClient();

    if (signingUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else if (!data.session) {
        // Supabase is set to confirm addresses, so there is no login yet.
        setCheckEmail(true);
      } else {
        finish();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else finish();
    }

    setBusy(false);
  }

  function finish() {
    // refresh() re-runs the pages on the server so the header notices the new
    // login. Without it you would stay looking signed out until a hard reload.
    router.push("/");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="auth-note">
        <strong>Check your email</strong>
        <p>
          We sent a confirmation link to <b>{email}</b>. Click it, and you will
          be signed in.
        </p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={signingUp ? "new-password" : "current-password"}
          minLength={6}
          required
        />
        {signingUp && <small>At least 6 characters.</small>}
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? "One moment…" : signingUp ? "Create account" : "Sign in"}
      </button>

      <p className="auth-swap">
        {signingUp ? (
          <>
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/sign-up">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
