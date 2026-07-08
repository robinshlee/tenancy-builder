"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PartyInput } from "@/lib/agreements/types";

type PropertyInput = {
  address: string;
  suburb: string;
  city: string;
  postal_code: string;
  property_type: string;
  bedrooms: string;
  description: string;
};

export type AgreementFormValues = {
  landlords: PartyInput[];
  tenants: PartyInput[];
  property: PropertyInput;
  rental_amount: string;
  deposit_amount: string;
  lease_start_date: string;
  lease_end_date: string;
  payment_due_day: string;
  special_conditions: string;
};

const emptyParty: PartyInput = { full_name: "", id_number: "", phone: "", email: "", address: "" };

export const emptyFormValues: AgreementFormValues = {
  landlords: [{ ...emptyParty }],
  tenants: [{ ...emptyParty }],
  property: { address: "", suburb: "", city: "", postal_code: "", property_type: "", bedrooms: "", description: "" },
  rental_amount: "",
  deposit_amount: "",
  lease_start_date: "",
  lease_end_date: "",
  payment_due_day: "1",
  special_conditions: "",
};

function PartyFields({
  title,
  kind,
  parties,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  kind: "landlords" | "tenants";
  parties: PartyInput[];
  onChange: (index: number, field: keyof PartyInput, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-semibold text-neutral-900">{title}</legend>
      {parties.map((party, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 p-4 border border-neutral-200 rounded-md relative">
          {parties.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
          <label className="col-span-1 text-sm">
            Full name *
            <input
              data-testid={`${kind}-${i}-full_name`}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={party.full_name}
              onChange={(e) => onChange(i, "full_name", e.target.value)}
              required
            />
          </label>
          <label className="col-span-1 text-sm">
            ID number *
            <input
              data-testid={`${kind}-${i}-id_number`}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={party.id_number}
              onChange={(e) => onChange(i, "id_number", e.target.value)}
              required
            />
          </label>
          <label className="col-span-1 text-sm">
            Phone
            <input
              data-testid={`${kind}-${i}-phone`}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={party.phone}
              onChange={(e) => onChange(i, "phone", e.target.value)}
            />
          </label>
          <label className="col-span-1 text-sm">
            Email
            <input
              data-testid={`${kind}-${i}-email`}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={party.email}
              onChange={(e) => onChange(i, "email", e.target.value)}
            />
          </label>
          <label className="col-span-2 text-sm">
            Address
            <input
              data-testid={`${kind}-${i}-address`}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={party.address}
              onChange={(e) => onChange(i, "address", e.target.value)}
            />
          </label>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-sm text-neutral-700 hover:underline">
        + Add another {title.toLowerCase().replace(/s$/, "")}
      </button>
    </fieldset>
  );
}

export function AgreementForm({
  mode,
  agreementId,
  initialValues,
}: {
  mode: "create" | "edit";
  agreementId?: string;
  initialValues: AgreementFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AgreementFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateParty(kind: "landlords" | "tenants", index: number, field: keyof PartyInput, value: string) {
    setValues((v) => {
      const next = [...v[kind]];
      next[index] = { ...next[index], [field]: value };
      return { ...v, [kind]: next };
    });
  }

  function addParty(kind: "landlords" | "tenants") {
    setValues((v) => ({ ...v, [kind]: [...v[kind], { ...emptyParty }] }));
  }

  function removeParty(kind: "landlords" | "tenants", index: number) {
    setValues((v) => ({ ...v, [kind]: v[kind].filter((_, i) => i !== index) }));
  }

  function clientValidate(): string | null {
    if (values.lease_start_date && values.lease_end_date) {
      if (new Date(values.lease_end_date) < new Date(values.lease_start_date)) {
        return "Lease end date must be after the start date.";
      }
    }
    if (!values.rental_amount || Number.isNaN(Number(values.rental_amount)) || Number(values.rental_amount) <= 0) {
      return "Rental amount must be a positive number.";
    }
    for (const l of values.landlords) {
      if (!l.full_name.trim() || !l.id_number.trim()) return "Every landlord needs a name and ID number.";
    }
    for (const t of values.tenants) {
      if (!t.full_name.trim() || !t.id_number.trim()) return "Every tenant needs a name and ID number.";
    }
    if (!values.property.address.trim()) return "Property address is required.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const clientError = clientValidate();
    if (clientError) {
      setFormError(clientError);
      return;
    }

    const payload = {
      landlords: values.landlords.map((l) => ({ ...l })),
      tenants: values.tenants.map((t) => ({ ...t })),
      property: {
        address: values.property.address,
        suburb: values.property.suburb || undefined,
        city: values.property.city || undefined,
        postal_code: values.property.postal_code || undefined,
        property_type: values.property.property_type || undefined,
        bedrooms: values.property.bedrooms ? Number(values.property.bedrooms) : undefined,
        description: values.property.description || undefined,
      },
      rental_amount: Number(values.rental_amount),
      deposit_amount: values.deposit_amount ? Number(values.deposit_amount) : undefined,
      lease_start_date: values.lease_start_date,
      lease_end_date: values.lease_end_date,
      payment_due_day: Number(values.payment_due_day),
      special_conditions: values.special_conditions || undefined,
    };

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/agreements" : `/api/agreements/${agreementId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.fieldErrors) {
          const map: Record<string, string> = {};
          for (const fe of body.fieldErrors) map[fe.field] = fe.message;
          setFieldErrors(map);
        }
        setFormError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const body = await res.json();
      router.push(`/agreements/${body.agreement.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {formError && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{formError}</div>
      )}

      <PartyFields
        title="Landlords"
        kind="landlords"
        parties={values.landlords}
        onChange={(i, f, v) => updateParty("landlords", i, f, v)}
        onAdd={() => addParty("landlords")}
        onRemove={(i) => removeParty("landlords", i)}
      />

      <PartyFields
        title="Tenants"
        kind="tenants"
        parties={values.tenants}
        onChange={(i, f, v) => updateParty("tenants", i, f, v)}
        onAdd={() => addParty("tenants")}
        onRemove={(i) => removeParty("tenants", i)}
      />

      <fieldset className="space-y-4">
        <legend className="font-semibold text-neutral-900">Property</legend>
        <div className="grid grid-cols-2 gap-3 p-4 border border-neutral-200 rounded-md">
          <label className="col-span-2 text-sm">
            Address *
            <input
              data-testid="property-address"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.address}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, address: e.target.value } }))}
              required
            />
          </label>
          <label className="text-sm">
            Suburb
            <input
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.suburb}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, suburb: e.target.value } }))}
            />
          </label>
          <label className="text-sm">
            City
            <input
              data-testid="property-city"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.city}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, city: e.target.value } }))}
            />
          </label>
          <label className="text-sm">
            Postal code
            <input
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.postal_code}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, postal_code: e.target.value } }))}
            />
          </label>
          <label className="text-sm">
            Property type
            <select
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.property_type}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, property_type: e.target.value } }))}
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
              value={values.property.bedrooms}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, bedrooms: e.target.value } }))}
            />
          </label>
          <label className="col-span-2 text-sm">
            Description
            <textarea
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.property.description}
              onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, description: e.target.value } }))}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold text-neutral-900">Deal terms</legend>
        <div className="grid grid-cols-2 gap-3 p-4 border border-neutral-200 rounded-md">
          <label className="text-sm">
            Monthly rent (GHS) *
            <input
              data-testid="rental_amount"
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.rental_amount}
              onChange={(e) => setValues((v) => ({ ...v, rental_amount: e.target.value }))}
              required
            />
          </label>
          <label className="text-sm">
            Deposit (GHS)
            <input
              data-testid="deposit_amount"
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.deposit_amount}
              onChange={(e) => setValues((v) => ({ ...v, deposit_amount: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Lease start *
            <input
              data-testid="lease_start_date"
              type="date"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.lease_start_date}
              onChange={(e) => setValues((v) => ({ ...v, lease_start_date: e.target.value }))}
              required
            />
          </label>
          <label className="text-sm">
            Lease end *
            <input
              data-testid="lease_end_date"
              type="date"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.lease_end_date}
              onChange={(e) => setValues((v) => ({ ...v, lease_end_date: e.target.value }))}
              required
            />
          </label>
          <label className="text-sm">
            Payment due day (1–31) *
            <input
              data-testid="payment_due_day"
              type="number"
              min={1}
              max={31}
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.payment_due_day}
              onChange={(e) => setValues((v) => ({ ...v, payment_due_day: e.target.value }))}
              required
            />
          </label>
          <label className="col-span-2 text-sm">
            Special conditions (free text)
            <textarea
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
              value={values.special_conditions}
              onChange={(e) => setValues((v) => ({ ...v, special_conditions: e.target.value }))}
            />
          </label>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "create" ? "Generate Agreement" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
