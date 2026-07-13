import type { AgreementFormInput } from "./types";

export type ValidationIssue = { field: string; message: string };
export type ValidationWarning = { field: string; message: string };

export type ValidationResult = {
  errors: ValidationIssue[];
  warnings: ValidationWarning[];
};

const ID_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{4,}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAgreementInputs(
  input: Partial<AgreementFormInput>,
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  // A landlord is only supplied by the client when creating a brand new property inline.
  // When an existing property is selected, its landlord_id is resolved server-side instead.
  if (!input.property?.id) {
    if (!input.landlord || !input.landlord.full_name?.trim() || !input.landlord.id_number?.trim()) {
      errors.push({ field: "landlord", message: "Landlord name and ID number are required for a new property." });
    } else if (!ID_NUMBER_PATTERN.test(input.landlord.id_number.trim())) {
      warnings.push({ field: "landlord.id_number", message: "Landlord ID number format looks unusual." });
    }
    if (input.landlord?.email?.trim() && !EMAIL_PATTERN.test(input.landlord.email.trim())) {
      errors.push({ field: "landlord.email", message: "Landlord email address is not valid." });
    }
  }

  if (!input.tenants || input.tenants.length === 0) {
    errors.push({ field: "tenants", message: "At least one tenant is required." });
  } else if (input.tenants.length > 3) {
    errors.push({ field: "tenants", message: "A maximum of 3 tenants is allowed per agreement." });
  } else {
    input.tenants.forEach((t, i) => {
      if (!t.full_name?.trim()) errors.push({ field: `tenants.${i}.full_name`, message: "Tenant name is required." });
      if (!t.id_number?.trim()) errors.push({ field: `tenants.${i}.id_number`, message: "Tenant ID number is required." });
      else if (!ID_NUMBER_PATTERN.test(t.id_number.trim())) warnings.push({ field: `tenants.${i}.id_number`, message: "Tenant ID number format looks unusual." });
      if (t.email?.trim() && !EMAIL_PATTERN.test(t.email.trim())) {
        errors.push({ field: `tenants.${i}.email`, message: "Tenant email address is not valid." });
      }
    });
  }

  // When an existing property is selected, its address is authoritative server-side —
  // the client only needs to supply an address when creating a brand new property.
  if (!input.property?.id && !input.property?.address?.trim()) {
    errors.push({ field: "property.address", message: "Property address is required." });
  }

  if (input.rental_amount === undefined || input.rental_amount === null || Number.isNaN(Number(input.rental_amount))) {
    errors.push({ field: "rental_amount", message: "Rental amount must be a number." });
  } else if (Number(input.rental_amount) <= 0) {
    errors.push({ field: "rental_amount", message: "Rental amount must be greater than 0." });
  }

  if (input.deposit_amount !== undefined && input.deposit_amount !== null && input.deposit_amount !== ("" as unknown)) {
    if (Number.isNaN(Number(input.deposit_amount))) {
      errors.push({ field: "deposit_amount", message: "Deposit amount must be a number." });
    } else if (Number(input.deposit_amount) < Number(input.rental_amount ?? 0)) {
      warnings.push({ field: "deposit_amount", message: "Deposit is lower than the monthly rent — unusually low." });
    }
  }

  if (!input.lease_start_date) {
    errors.push({ field: "lease_start_date", message: "Lease start date is required." });
  }
  if (!input.lease_end_date) {
    errors.push({ field: "lease_end_date", message: "Lease end date is required." });
  }
  if (input.lease_start_date && input.lease_end_date) {
    const start = new Date(input.lease_start_date);
    const end = new Date(input.lease_end_date);
    if (end < start) {
      errors.push({ field: "lease_end_date", message: "Lease end date must be after the start date." });
    } else {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (months > 24) {
        warnings.push({ field: "lease_end_date", message: `Lease duration is ${months} months — confirm this is a long lease.` });
      }
    }
  }

  if (
    input.payment_due_day === undefined ||
    input.payment_due_day === null ||
    Number(input.payment_due_day) < 1 ||
    Number(input.payment_due_day) > 31
  ) {
    errors.push({ field: "payment_due_day", message: "Payment due day must be between 1 and 31." });
  }

  return { errors, warnings };
}
