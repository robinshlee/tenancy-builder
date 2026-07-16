"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Always show the same success state regardless of whether the email exists,
      // so this can't be used to probe which addresses have accounts.
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 text-sm">
          If an account exists for {email}, a password reset link has been sent. Check your inbox.
        </div>
        <p className="text-sm text-slate-400 text-center">
          <Link href="/login" className="text-teal-300 hover:text-teal-200 underline">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{error}</div>
      )}
      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-sm text-slate-400 text-center">
        <Link href="/login" className="text-teal-300 hover:text-teal-200 underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
