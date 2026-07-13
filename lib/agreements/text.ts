import type { Landlord, Property, Tenant } from "./types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatMoney(amount: number): string {
  return `RM ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function generateAgreementText(params: {
  reference_number: string;
  landlords: Pick<Landlord, "full_name" | "id_number" | "address">[];
  tenants: Pick<Tenant, "full_name" | "id_number" | "current_address">[];
  property: Pick<Property, "address" | "suburb" | "city" | "property_type" | "bedrooms" | "description">;
  rental_amount: number;
  deposit_amount?: number | null;
  lease_start_date: string;
  lease_end_date: string;
  payment_due_day: number;
  special_conditions?: string | null;
  letterhead_name?: string | null;
  boilerplate_clauses?: string | null;
  use_of_premises?: string | null;
  renewal_terms?: string | null;
  rent_payment_details?: string | null;
  utility_deposit_amount?: number | null;
  access_card_deposit_notes?: string | null;
}): string {
  const {
    reference_number,
    landlords,
    tenants,
    property,
    rental_amount,
    deposit_amount,
    lease_start_date,
    lease_end_date,
    payment_due_day,
    special_conditions,
    letterhead_name,
    boilerplate_clauses,
    use_of_premises,
    renewal_terms,
    rent_payment_details,
    utility_deposit_amount,
    access_card_deposit_notes,
  } = params;

  const propertyLine = [property.address, property.suburb, property.city].filter(Boolean).join(", ");
  const landlordLines = landlords
    .map((l) => `  - ${l.full_name} (ID: ${l.id_number})${l.address ? `, of ${l.address}` : ""}`)
    .join("\n");
  const tenantLines = tenants
    .map((t) => `  - ${t.full_name} (ID: ${t.id_number})${t.current_address ? `, of ${t.current_address}` : ""}`)
    .join("\n");

  const lines: string[] = [];
  if (letterhead_name?.trim()) {
    lines.push(letterhead_name.trim());
    lines.push("");
  }
  lines.push("TENANCY AGREEMENT");
  lines.push(`Reference: ${reference_number}`);
  lines.push("");
  lines.push("This Tenancy Agreement is made between:");
  lines.push("");
  lines.push("THE LANDLORD(S):");
  lines.push(landlordLines);
  lines.push("");
  lines.push("AND THE TENANT(S):");
  lines.push(tenantLines);
  lines.push("");
  lines.push("PROPERTY:");
  lines.push(`  ${propertyLine}`);
  if (property.property_type || property.bedrooms) {
    lines.push(
      `  ${[property.property_type, property.bedrooms ? `${property.bedrooms} bedroom(s)` : null].filter(Boolean).join(", ")}`,
    );
  }
  if (property.description) {
    lines.push(`  ${property.description}`);
  }
  lines.push("");
  lines.push("TERMS:");
  lines.push(`  1. Rent: ${formatMoney(rental_amount)} per month, due on the ${ordinal(payment_due_day)} day of each month.`);
  lines.push(
    `  2. Security Deposit: ${deposit_amount != null ? formatMoney(deposit_amount) : "N/A"}, refundable at the end of the tenancy subject to the condition of the property.`,
  );
  lines.push(`  3. Lease Term: from ${formatDate(lease_start_date)} to ${formatDate(lease_end_date)}.`);
  lines.push(
    "  4. The Tenant shall use the property solely for residential purposes and shall not sublet without the Landlord's written consent.",
  );
  lines.push("  5. The Tenant shall maintain the property in good condition, fair wear and tear excepted.");
  lines.push("  6. Either party may terminate this Agreement in accordance with applicable law upon expiry of the lease term.");

  if (special_conditions?.trim()) {
    lines.push("");
    lines.push("SPECIAL CONDITIONS:");
    lines.push(
      special_conditions
        .trim()
        .split("\n")
        .map((l) => `  - ${l}`)
        .join("\n"),
    );
  }

  const scheduleItems: [string, string][] = (
    [
      ["Use of Premises", use_of_premises],
      ["Renewal / Option", renewal_terms],
      ["Rent Payment Details", rent_payment_details],
      ["Utility Deposit", utility_deposit_amount != null ? formatMoney(utility_deposit_amount) : null],
      ["Access Card / Deposit Terms", access_card_deposit_notes],
    ] as [string, string | null | undefined][]
  ).filter((pair): pair is [string, string] => !!pair[1]?.trim());

  if (scheduleItems.length > 0 || boilerplate_clauses?.trim()) {
    lines.push("");
    lines.push("SCHEDULE:");
    scheduleItems.forEach(([label, value], i) => {
      lines.push(`  ${i + 1}. ${label}: ${value.trim()}`);
    });
    if (boilerplate_clauses?.trim()) {
      lines.push("");
      lines.push("  Additional notes:");
      lines.push(
        boilerplate_clauses
          .trim()
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => `  - ${l.trim()}`)
          .join("\n"),
      );
    }
  }

  lines.push("");
  lines.push("SIGNATURES:");
  lines.push("");
  landlords.forEach((l) => {
    lines.push(`  Landlord: _______________________________   ${l.full_name}`);
    lines.push("  Date: __________________");
    lines.push("");
  });
  tenants.forEach((t) => {
    lines.push(`  Tenant: _______________________________   ${t.full_name}`);
    lines.push("  Date: __________________");
    lines.push("");
  });

  return lines.join("\n");
}

export function appendAcceptedClauses(baseText: string, clauseTexts: string[]): string {
  if (clauseTexts.length === 0) return baseText;
  const block = ["", "ADDITIONAL CLAUSES:", ...clauseTexts.map((c) => `  - ${c}`)].join("\n");
  const signatureIndex = baseText.indexOf("SIGNATURES:");
  if (signatureIndex === -1) return baseText + block;
  return baseText.slice(0, signatureIndex) + block.trimStart() + "\n\n" + baseText.slice(signatureIndex);
}
