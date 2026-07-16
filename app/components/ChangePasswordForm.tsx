"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/app/components/ToastProvider";

export function ChangePasswordForm({ email }: { email: string }) {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setError("Your current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError("Something went wrong. Please try again.");
        return;
      }

      showToast("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{error}</div>
      )}
      <label className="block text-sm text-slate-300">
        Current password
        <input
          type="password"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm text-slate-300">
        New password
        <input
          type="password"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
        className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
