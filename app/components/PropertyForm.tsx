"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertyProfileInput } from "@/lib/profiles/server";

type PropertyFormValues = {
  address: string;
  suburb: string;
  city: string;
  postal_code: string;
  property_type: string;
  bedrooms: string;
  description: string;
  landlord_id: string;
  group_id: string;
};

export type ExistingLandlordOption = { id: string; full_name: string; id_number: string };
export type ExistingGroupOption = { id: string; name: string };

export function PropertyForm({
  mode,
  propertyId,
  initialValues,
  existingLandlords,
  existingGroups,
}: {
  mode: "create" | "edit";
  propertyId?: string;
  initialValues: PropertyFormValues;
  existingLandlords: ExistingLandlordOption[];
  existingGroups: ExistingGroupOption[];
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

    if (!values.address.trim()) {
      showError("Address is required.");
      return;
    }
    if (!values.landlord_id) {
      showError("Every property must have a landlord.");
      return;
    }

    const payload: PropertyProfileInput = {
      address: values.address,
      suburb: values.suburb || undefined,
      city: values.city || undefined,
      postal_code: values.postal_code || undefined,
      property_type: values.property_type || undefined,
      bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
      description: values.description || undefined,
      landlord_id: values.landlord_id,
      group_id: values.group_id || undefined,
    };

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/properties" : `/api/properties/${propertyId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/properties");
      router.refresh();
    } catch {
      showError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div ref={errorRef} className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-neutral-200 rounded-md bg-white">
        <label className="col-span-2 text-sm">
          Address *
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.address}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            required
          />
        </label>
        <label className="text-sm">
          Landlord *
          <select
            data-testid="property-landlord"
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.landlord_id}
            onChange={(e) => setValues((v) => ({ ...v, landlord_id: e.target.value }))}
            required
          >
            <option value="">Select landlord…</option>
            {existingLandlords.map((l) => (
              <option key={l.id} value={l.id}>
                {l.full_name} ({l.id_number})
              </option>
            ))}
          </select>
          {existingLandlords.length === 0 && (
            <span className="block mt-1 text-xs text-neutral-500">
              No landlords yet — <a href="/landlords/new" className="underline">add one first</a>.
            </span>
          )}
        </label>
        <label className="text-sm">
          Property group
          <select
            data-testid="property-group"
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.group_id}
            onChange={(e) => setValues((v) => ({ ...v, group_id: e.target.value }))}
          >
            <option value="">No group</option>
            {existingGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Suburb
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.suburb}
            onChange={(e) => setValues((v) => ({ ...v, suburb: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          City
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.city}
            onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Postal code
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.postal_code}
            onChange={(e) => setValues((v) => ({ ...v, postal_code: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Property type
          <select
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.property_type}
            onChange={(e) => setValues((v) => ({ ...v, property_type: e.target.value }))}
          >
            <option value="">Select…</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Commercial">Commercial</option>
          </select>
        </label>
        <label className="text-sm">
          Bedrooms
          <input
            type="number"
            min={0}
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.bedrooms}
            onChange={(e) => setValues((v) => ({ ...v, bedrooms: e.target.value }))}
          />
        </label>
        <label className="col-span-2 text-sm">
          Description
          <textarea
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm hover:bg-neutral-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create Property" : "Save Changes"}
      </button>
    </form>
  );
}
