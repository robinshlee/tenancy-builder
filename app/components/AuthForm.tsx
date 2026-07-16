"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";

const ACCESS_DENIED_MESSAGE = "User does not have permission to access";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { company_name: companyName.trim(), full_name: fullName.trim() } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }
      // New accounts start as 'pending' until an admin approves them, so never leave
      // a live session around even if email confirmation is switched off project-wide.
      await supabase.auth.signOut();
      fetch("/api/auth/notify-admins-of-pending-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, companyName: companyName.trim() }),
      }).catch(() => {});
      setShowPendingModal(true);
      setSubmitting(false);
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      setError(ACCESS_DENIED_MESSAGE);
      setSubmitting(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", signInData.user.id)
      .maybeSingle();

    if (profileError || profile?.status !== "active") {
      await supabase.auth.signOut();
      setError(ACCESS_DENIED_MESSAGE);
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

      {mode === "signup" && (
        <label className="block text-sm text-slate-300">
          Full name
          <input
            type="text"
            data-testid="auth-full-name"
            className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ama Mensah"
            required
          />
        </label>
      )}
      {mode === "signup" && (
        <label className="block text-sm text-slate-300">
          Company name
          <input
            type="text"
            data-testid="auth-company-name"
            className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Property Management"
            required
          />
        </label>
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
      {mode === "signup" && (
        <label className="block text-sm text-slate-300">
          Confirm password
          <input
            type="password"
            data-testid="auth-confirm-password"
            className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
      )}

      {mode === "login" && (
        <p className="text-right -mt-2">
          <Link href="/forgot-password" className="text-xs text-teal-300 hover:text-teal-200 underline">
            Forgot password?
          </Link>
        </p>
      )}

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

      <ConfirmDialog
        open={showPendingModal}
        title="Application submitted"
        message="Your application is being reviewed for approval. You'll be able to log in once an admin approves your account."
        confirmLabel="OK"
        hideCancel
        onConfirm={() => router.push("/login")}
        onCancel={() => router.push("/login")}
      />
    </form>
  );
}
