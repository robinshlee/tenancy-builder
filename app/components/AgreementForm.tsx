"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_PATTERN } from "@/lib/agreements/validation";
import { emptyParty, emptyProperty } from "./agreementFormShared";
import type {
  PartyInput,
  PropertyInput,
  ExistingLandlord,
  ExistingTenant,
  ExistingPropertyGroup,
  ExistingProperty,
  ScheduleInput,
  AgreementFormValues,
} from "./agreementFormShared";

export type {
  ExistingLandlord,
  ExistingTenant,
  ExistingPropertyGroup,
  ExistingProperty,
  ScheduleInput,
  AgreementFormValues,
} from "./agreementFormShared";

function PartyFields({
  title,
  kind,
  parties,
  existingOptions,
  onChange,
  onSelectExisting,
  onAdd,
  onRemove,
}: {
  title: string;
  kind: "landlords" | "tenants";
  parties: PartyInput[];
  existingOptions: (ExistingLandlord | ExistingTenant)[];
  onChange: (index: number, field: keyof PartyInput, value: string) => void;
  onSelectExisting: (index: number, id: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-semibold text-white">{title}</legend>
      {parties.map((party, i) => (
        <div key={i} className="p-4 border border-white/10 rounded-md relative space-y-3">
          {parties.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 text-xs text-red-400 hover:underline"
            >
              Remove
            </button>
          )}

          {existingOptions.length > 0 && (
            <label className="block text-sm">
              Use existing {title.toLowerCase().replace(/s$/, "")}
              <select
                data-testid={`${kind}-${i}-existing`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                value={party.id ?? ""}
                onChange={(e) => onSelectExisting(i, e.target.value)}
              >
                <option value="">+ Enter new {title.toLowerCase().replace(/s$/, "")}</option>
                {existingOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.full_name} ({opt.id_number})
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="col-span-1 text-sm">
              Full name *
              <input
                data-testid={`${kind}-${i}-full_name`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={party.full_name}
                onChange={(e) => onChange(i, "full_name", e.target.value)}
                disabled={!!party.id}
                required
              />
            </label>
            <label className="col-span-1 text-sm">
              ID number *
              <input
                data-testid={`${kind}-${i}-id_number`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={party.id_number}
                onChange={(e) => onChange(i, "id_number", e.target.value)}
                disabled={!!party.id}
                required
              />
            </label>
            <label className="col-span-1 text-sm">
              Phone
              <input
                data-testid={`${kind}-${i}-phone`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={party.phone}
                onChange={(e) => onChange(i, "phone", e.target.value)}
                disabled={!!party.id}
              />
            </label>
            <label className="col-span-1 text-sm">
              Email
              <input
                type="email"
                data-testid={`${kind}-${i}-email`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={party.email}
                onChange={(e) => onChange(i, "email", e.target.value)}
                disabled={!!party.id}
              />
            </label>
            <label className="col-span-2 text-sm">
              Address
              <input
                data-testid={`${kind}-${i}-address`}
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={party.address}
                onChange={(e) => onChange(i, "address", e.target.value)}
                disabled={!!party.id}
              />
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
        + Add another {title.toLowerCase().replace(/s$/, "")}
      </button>
    </fieldset>
  );
}

export function AgreementForm({
  mode,
  agreementId,
  initialValues,
  existingLandlords = [],
  existingTenants = [],
  existingProperties = [],
  existingPropertyGroups = [],
}: {
  mode: "create" | "edit";
  agreementId?: string;
  initialValues: AgreementFormValues;
  existingLandlords?: ExistingLandlord[];
  existingTenants?: ExistingTenant[];
  existingProperties?: ExistingProperty[];
  existingPropertyGroups?: ExistingPropertyGroup[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<AgreementFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const isExistingProperty = !!values.property.id;

  function showError(message: string) {
    setFormError(message);
    requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function updateTenant(index: number, field: keyof PartyInput, value: string) {
    setValues((v) => {
      const next = [...v.tenants];
      next[index] = { ...next[index], [field]: value };
      return { ...v, tenants: next };
    });
  }

  function updateLandlord(field: keyof PartyInput, value: string) {
    setValues((v) => ({ ...v, landlord: { ...v.landlord, [field]: value } }));
  }

  function selectExistingLandlord(_index: number, id: string) {
    if (!id) {
      setValues((v) => ({ ...v, landlord: { ...emptyParty } }));
      return;
    }
    const found = existingLandlords.find((l) => l.id === id);
    if (!found) return;
    setValues((v) => ({
      ...v,
      landlord: {
        id: found.id,
        full_name: found.full_name,
        id_number: found.id_number,
        phone: found.phone ?? "",
        email: found.email ?? "",
        address: found.address ?? "",
      },
    }));
  }

  function selectExistingTenant(index: number, id: string) {
    setValues((v) => {
      const next = [...v.tenants];
      if (!id) {
        next[index] = { ...emptyParty };
      } else {
        const found = existingTenants.find((t) => t.id === id);
        if (found) {
          next[index] = {
            id: found.id,
            full_name: found.full_name,
            id_number: found.id_number,
            phone: found.phone ?? "",
            email: found.email ?? "",
            address: found.current_address ?? "",
          };
        }
      }
      return { ...v, tenants: next };
    });
  }

  function selectExistingProperty(id: string) {
    setValues((v) => {
      if (!id) {
        return { ...v, property: { ...emptyProperty }, landlord: { ...emptyParty } };
      }
      const found = existingProperties.find((p) => p.id === id);
      if (!found) return v;
      return {
        ...v,
        property: {
          id: found.id,
          address: found.address,
          suburb: found.suburb ?? "",
          city: found.city ?? "",
          postal_code: found.postal_code ?? "",
          property_type: found.property_type ?? "",
          bedrooms: found.bedrooms != null ? String(found.bedrooms) : "",
          description: found.description ?? "",
          group_id: found.group_id ?? "",
        },
        // The property's landlord is fixed and shown read-only; it isn't user-editable here.
        landlord: found.landlord
          ? {
              id: found.landlord.id,
              full_name: found.landlord.full_name,
              id_number: found.landlord.id_number,
              phone: "",
              email: "",
              address: "",
            }
          : { ...emptyParty },
      };
    });
  }

  function addTenant() {
    setValues((v) => ({ ...v, tenants: [...v.tenants, { ...emptyParty }] }));
  }

  function removeTenant(index: number) {
    setValues((v) => ({ ...v, tenants: v.tenants.filter((_, i) => i !== index) }));
  }

  function clientValidate(): string | null {
    if (!values.property.address.trim() && !values.property.id) return "Property address is required.";
    if (!isExistingProperty) {
      if (!values.landlord.full_name.trim() || !values.landlord.id_number.trim()) {
        return "Landlord name and ID number are required for a new property.";
      }
      if (values.landlord.email.trim() && !EMAIL_PATTERN.test(values.landlord.email.trim())) {
        return "The landlord email address is not valid.";
      }
    }
    if (values.lease_start_date && values.lease_end_date) {
      if (new Date(values.lease_end_date) < new Date(values.lease_start_date)) {
        return "Lease end date must be after the start date.";
      }
    }
    if (!values.rental_amount || Number.isNaN(Number(values.rental_amount)) || Number(values.rental_amount) <= 0) {
      return "Rental amount must be a positive number.";
    }
    for (const t of values.tenants) {
      if (!t.full_name.trim() || !t.id_number.trim()) return "Every tenant needs a name and ID number.";
      if (t.email.trim() && !EMAIL_PATTERN.test(t.email.trim())) return "One of the tenant email addresses is not valid.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const clientError = clientValidate();
    if (clientError) {
      showError(clientError);
      return;
    }

    const payload = {
      property: {
        id: values.property.id,
        address: values.property.address,
        suburb: values.property.suburb || undefined,
        city: values.property.city || undefined,
        postal_code: values.property.postal_code || undefined,
        property_type: values.property.property_type || undefined,
        bedrooms: values.property.bedrooms ? Number(values.property.bedrooms) : undefined,
        description: values.property.description || undefined,
        group_id: values.property.group_id || undefined,
      },
      landlord: isExistingProperty ? undefined : { ...values.landlord },
      tenants: values.tenants.map((t) => ({ ...t })),
      rental_amount: Number(values.rental_amount),
      deposit_amount: values.deposit_amount ? Number(values.deposit_amount) : undefined,
      lease_start_date: values.lease_start_date,
      lease_end_date: values.lease_end_date,
      payment_due_day: Number(values.payment_due_day),
      special_conditions: values.special_conditions || undefined,
      schedule: {
        notice_period: values.schedule.notice_period || undefined,
        renewal_terms: values.schedule.renewal_terms || undefined,
        maintenance_responsibility: values.schedule.maintenance_responsibility || undefined,
        utilities_responsibility: values.schedule.utilities_responsibility || undefined,
        inventory_notes: values.schedule.inventory_notes || undefined,
      },
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
        showError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const body = await res.json();
      router.push(`/agreements/${body.agreement.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      showError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {formError && (
        <div ref={errorRef} className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          {formError}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="font-semibold text-white">Property</legend>
        <div className="p-4 border border-white/10 rounded-md space-y-3">
          {existingProperties.length > 0 && (
            <label className="block text-sm">
              Use existing property
              <select
                data-testid="property-existing"
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                value={values.property.id ?? ""}
                onChange={(e) => selectExistingProperty(e.target.value)}
              >
                <option value="">+ Enter new property</option>
                {existingProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address}
                    {p.city ? `, ${p.city}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="col-span-2 text-sm">
              Address *
              <input
                data-testid="property-address"
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.address}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, address: e.target.value } }))}
                disabled={isExistingProperty}
                required
              />
            </label>
            <label className="text-sm">
              Suburb
              <input
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.suburb}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, suburb: e.target.value } }))}
                disabled={isExistingProperty}
              />
            </label>
            <label className="text-sm">
              City
              <input
                data-testid="property-city"
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.city}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, city: e.target.value } }))}
                disabled={isExistingProperty}
              />
            </label>
            <label className="text-sm">
              Postal code
              <input
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.postal_code}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, postal_code: e.target.value } }))}
                disabled={isExistingProperty}
              />
            </label>
            <label className="text-sm">
              Property type
              <select
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.property_type}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, property_type: e.target.value } }))}
                disabled={isExistingProperty}
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
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.bedrooms}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, bedrooms: e.target.value } }))}
                disabled={isExistingProperty}
              />
            </label>
            {!isExistingProperty && existingPropertyGroups.length > 0 && (
              <label className="text-sm">
                Property group (optional)
                <select
                  data-testid="property-group"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                  value={values.property.group_id}
                  onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, group_id: e.target.value } }))}
                >
                  <option value="">No group</option>
                  {existingPropertyGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="col-span-2 text-sm">
              Description
              <textarea
                className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                value={values.property.description}
                onChange={(e) => setValues((v) => ({ ...v, property: { ...v.property, description: e.target.value } }))}
                disabled={isExistingProperty}
              />
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold text-white">Landlord</legend>
        {isExistingProperty ? (
          <div className="p-4 border border-white/10 rounded-md bg-navy-800/40 text-sm">
            <p className="text-slate-400 mb-1">Set automatically from the selected property.</p>
            <p className="font-medium">{values.landlord.full_name || "—"}</p>
            <p className="text-slate-300">{values.landlord.id_number}</p>
          </div>
        ) : (
          <div className="p-4 border border-white/10 rounded-md space-y-3">
            {existingLandlords.length > 0 && (
              <label className="block text-sm">
                Use existing landlord
                <select
                  data-testid="landlord-existing"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                  value={values.landlord.id ?? ""}
                  onChange={(e) => selectExistingLandlord(0, e.target.value)}
                >
                  <option value="">+ Enter new landlord</option>
                  {existingLandlords.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} ({l.id_number})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="col-span-1 text-sm">
                Full name *
                <input
                  data-testid="landlord-full_name"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                  value={values.landlord.full_name}
                  onChange={(e) => updateLandlord("full_name", e.target.value)}
                  disabled={!!values.landlord.id}
                  required
                />
              </label>
              <label className="col-span-1 text-sm">
                ID number *
                <input
                  data-testid="landlord-id_number"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                  value={values.landlord.id_number}
                  onChange={(e) => updateLandlord("id_number", e.target.value)}
                  disabled={!!values.landlord.id}
                  required
                />
              </label>
              <label className="col-span-1 text-sm">
                Phone
                <input
                  data-testid="landlord-phone"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                  value={values.landlord.phone}
                  onChange={(e) => updateLandlord("phone", e.target.value)}
                  disabled={!!values.landlord.id}
                />
              </label>
              <label className="col-span-1 text-sm">
                Email
                <input
                  type="email"
                  data-testid="landlord-email"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                  value={values.landlord.email}
                  onChange={(e) => updateLandlord("email", e.target.value)}
                  disabled={!!values.landlord.id}
                />
              </label>
              <label className="col-span-2 text-sm">
                Address
                <input
                  data-testid="landlord-address"
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:bg-navy-900/40 disabled:text-slate-500"
                  value={values.landlord.address}
                  onChange={(e) => updateLandlord("address", e.target.value)}
                  disabled={!!values.landlord.id}
                />
              </label>
            </div>
          </div>
        )}
      </fieldset>

      <PartyFields
        title="Tenants"
        kind="tenants"
        parties={values.tenants}
        existingOptions={existingTenants}
        onChange={updateTenant}
        onSelectExisting={selectExistingTenant}
        onAdd={addTenant}
        onRemove={removeTenant}
      />

      <fieldset className="space-y-4">
        <legend className="font-semibold text-white">Deal terms</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-white/10 rounded-md">
          <label className="text-sm">
            Monthly rent (GHS) *
            <input
              data-testid="rental_amount"
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
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
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.deposit_amount}
              onChange={(e) => setValues((v) => ({ ...v, deposit_amount: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Lease start *
            <input
              data-testid="lease_start_date"
              type="date"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
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
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
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
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.payment_due_day}
              onChange={(e) => setValues((v) => ({ ...v, payment_due_day: e.target.value }))}
              required
            />
          </label>
          <label className="col-span-2 text-sm">
            Special conditions (free text)
            <textarea
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.special_conditions}
              onChange={(e) => setValues((v) => ({ ...v, special_conditions: e.target.value }))}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-semibold text-white">Schedule</legend>
        <p className="text-sm text-slate-400 -mt-2">
          Standard lease terms attached to this agreement. Pre-filled from the admin&apos;s defaults — edit any of
          them for this agreement specifically.
        </p>
        <div className="grid grid-cols-1 gap-3 p-4 border border-white/10 rounded-md">
          <label className="text-sm">
            Notice period
            <textarea
              data-testid="schedule-notice_period"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.schedule.notice_period}
              onChange={(e) => setValues((v) => ({ ...v, schedule: { ...v.schedule, notice_period: e.target.value } }))}
            />
          </label>
          <label className="text-sm">
            Renewal / termination terms
            <textarea
              data-testid="schedule-renewal_terms"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.schedule.renewal_terms}
              onChange={(e) => setValues((v) => ({ ...v, schedule: { ...v.schedule, renewal_terms: e.target.value } }))}
            />
          </label>
          <label className="text-sm">
            Maintenance &amp; repair responsibilities
            <textarea
              data-testid="schedule-maintenance_responsibility"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.schedule.maintenance_responsibility}
              onChange={(e) =>
                setValues((v) => ({ ...v, schedule: { ...v.schedule, maintenance_responsibility: e.target.value } }))
              }
            />
          </label>
          <label className="text-sm">
            Utilities responsibility
            <textarea
              data-testid="schedule-utilities_responsibility"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.schedule.utilities_responsibility}
              onChange={(e) =>
                setValues((v) => ({ ...v, schedule: { ...v.schedule, utilities_responsibility: e.target.value } }))
              }
            />
          </label>
          <label className="text-sm">
            Inventory / condition notes
            <textarea
              data-testid="schedule-inventory_notes"
              className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              value={values.schedule.inventory_notes}
              onChange={(e) => setValues((v) => ({ ...v, schedule: { ...v.schedule, inventory_notes: e.target.value } }))}
            />
          </label>
        </div>
      </fieldset>

      <div className="space-y-3">
        {formError && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{formError}</div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving…" : mode === "create" ? "Generate Agreement" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
