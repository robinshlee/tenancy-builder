"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      if (signInData?.session) {
        router.push("/agreements");
        router.refresh();
        return;
      }
      setMessage("Account created. Check your email to confirm, then log in.");
      setSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    const next = searchParams.get("next") || "/agreements";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{error}</div>
      )}
      {message && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          data-testid="auth-email"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm text-slate-300">
        Password
        <input
          type="password"
          data-testid="auth-password"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-sm text-slate-400 text-center">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-teal-300 hover:text-teal-200 underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-teal-300 hover:text-teal-200 underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
