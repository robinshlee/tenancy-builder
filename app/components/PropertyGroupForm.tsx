"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertyGroupInput } from "@/lib/profiles/server";

export function PropertyGroupForm({
  mode,
  groupId,
  initialValues,
}: {
  mode: "create" | "edit";
  groupId?: string;
  initialValues: PropertyGroupInput;
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

    if (!values.name.trim()) {
      showError("Group name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/property-groups" : `/api/property-groups/${groupId}`;
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
      router.push("/property-groups");
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
        <label className="col-span-2 text-sm">
          Name *
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="e.g. Marina Towers"
            required
          />
        </label>
        <label className="text-sm">
          Address
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.address ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          City
          <input
            className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            value={values.city ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create Group" : "Save Changes"}
      </button>
    </form>
  );
}
