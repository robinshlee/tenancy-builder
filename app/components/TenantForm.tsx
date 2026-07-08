"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TenantProfileInput } from "@/lib/profiles/server";

export function TenantForm({
  mode,
  tenantId,
  initialValues,
}: {
  mode: "create" | "edit";
  tenantId?: string;
  initialValues: TenantProfileInput;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.full_name.trim() || !values.id_number.trim()) {
      setError("Full name and ID number are required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/tenants" : `/api/tenants/${tenantId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/tenants");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}
      <div className="grid grid-cols-2 gap-3 p-4 border border-neutral-200 rounded-md bg-white">
        <label className="col-span-1 text-sm">
          Full name *
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.full_name}
            onChange={(e) => setValues((v) => ({ ...v, full_name: e.target.value }))}
            required
          />
        </label>
        <label className="col-span-1 text-sm">
          ID number *
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.id_number}
            onChange={(e) => setValues((v) => ({ ...v, id_number: e.target.value }))}
            required
          />
        </label>
        <label className="col-span-1 text-sm">
          Phone
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.phone ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
        </label>
        <label className="col-span-1 text-sm">
          Email
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.email ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </label>
        <label className="col-span-2 text-sm">
          Current address
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.current_address ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, current_address: e.target.value }))}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm hover:bg-neutral-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create Tenant" : "Save Changes"}
      </button>
    </form>
  );
}
