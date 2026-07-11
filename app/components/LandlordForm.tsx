"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LandlordProfileInput } from "@/lib/profiles/server";
import { EMAIL_PATTERN } from "@/lib/agreements/validation";

export function LandlordForm({
  mode,
  landlordId,
  initialValues,
}: {
  mode: "create" | "edit";
  landlordId?: string;
  initialValues: LandlordProfileInput;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.full_name.trim() || !values.id_number.trim()) {
      showError("Full name and ID number are required.");
      return;
    }
    if (values.email?.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
      showError("Email address is not valid.");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/landlords" : `/api/landlords/${landlordId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/landlords");
      router.refresh();
    } catch {
      showError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div ref={errorRef} className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-white/10 rounded-md bg-navy-900/40">
        <label className="col-span-1 text-sm">
          Full name *
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.full_name}
            onChange={(e) => setValues((v) => ({ ...v, full_name: e.target.value }))}
            required
          />
        </label>
        <label className="col-span-1 text-sm">
          ID number *
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.id_number}
            onChange={(e) => setValues((v) => ({ ...v, id_number: e.target.value }))}
            required
          />
        </label>
        <label className="col-span-1 text-sm">
          Phone
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.phone ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
        </label>
        <label className="col-span-1 text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.email ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </label>
        <label className="col-span-2 text-sm">
          Address
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.address ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create Landlord" : "Save Changes"}
      </button>
    </form>
  );
}
