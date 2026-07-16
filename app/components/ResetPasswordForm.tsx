"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The recovery link's token is exchanged for a temporary session automatically by the
    // Supabase client as soon as it parses the URL, so by the time this effect runs there
    // should already be a session if the link was valid.
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(!!data.session);
      setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Something went wrong. Please request a new reset link and try again.");
        setSubmitting(false);
        return;
      }
      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-slate-400 text-center">Checking your link…</p>;
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 text-sm">
          Your password has been changed. You can now log in with your new password.
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
        >
          Go to log in
        </button>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
        This reset link is invalid or has expired. Request a new one from the &quot;Forgot password?&quot; link on the
        log in page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{error}</div>
      )}
      <label className="block text-sm text-slate-300">
        New password
        <input
          type="password"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <label className="block text-sm text-slate-300">
        Confirm new password
        <input
          type="password"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
