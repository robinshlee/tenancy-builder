import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
import { listLandlords, listProperties, listPropertyGroups, listTenants } from "@/lib/profiles/server";
import { AgreementForm, type AgreementFormValues } from "@/app/components/AgreementForm";

export default async function EditAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let agreement;
  let landlords, tenants, properties, propertyGroups;
  try {
    [agreement, landlords, tenants, properties, propertyGroups] = await Promise.all([
      getAgreementFull(supabase, id),
      listLandlords(supabase),
      listTenants(supabase),
      listProperties(supabase),
      listPropertyGroups(supabase),
    ]);
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong loading this agreement.");
  }

  if (!agreement) {
    notFound();
  }

  const currentLandlord = agreement.landlords[0];

  const initialValues: AgreementFormValues = {
    landlord: currentLandlord
      ? {
          id: currentLandlord.id,
          full_name: currentLandlord.full_name,
          id_number: currentLandlord.id_number,
          phone: currentLandlord.phone ?? "",
          email: currentLandlord.email ?? "",
          address: currentLandlord.address ?? "",
        }
      : { full_name: "", id_number: "", phone: "", email: "", address: "" },
    tenants: agreement.tenants.map((t) => ({
      id: t.id,
      full_name: t.full_name,
      id_number: t.id_number,
      phone: t.phone ?? "",
      email: t.email ?? "",
      address: t.current_address ?? "",
    })),
    property: {
      id: agreement.property.id,
      address: agreement.property.address,
      suburb: agreement.property.suburb ?? "",
      city: agreement.property.city ?? "",
      postal_code: agreement.property.postal_code ?? "",
      property_type: agreement.property.property_type ?? "",
      bedrooms: agreement.property.bedrooms != null ? String(agreement.property.bedrooms) : "",
      bathrooms: agreement.property.bathrooms != null ? String(agreement.property.bathrooms) : "",
      furnishing: agreement.property.furnishing ?? "",
      description: agreement.property.description ?? "",
      group_id: agreement.property.group_id ?? "",
    },
    rental_amount: String(agreement.rental_amount),
    deposit_amount: agreement.deposit_amount != null ? String(agreement.deposit_amount) : "",
    lease_start_date: agreement.lease_start_date,
    lease_end_date: agreement.lease_end_date,
    payment_due_day: String(agreement.payment_due_day),
    special_conditions: agreement.special_conditions ?? "",
    schedule: {
      use_of_premises: agreement.use_of_premises ?? "",
      renewal_terms: agreement.renewal_terms ?? "",
      rent_payment_details: agreement.rent_payment_details ?? "",
      utility_deposit_amount: agreement.utility_deposit_amount != null ? String(agreement.utility_deposit_amount) : "",
      access_card_deposit_notes: agreement.access_card_deposit_notes ?? "",
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {agreement.reference_number}</h1>
      <AgreementForm
        mode="edit"
        agreementId={id}
        initialValues={initialValues}
        existingLandlords={landlords}
        existingTenants={tenants}
        existingProperties={properties}
        existingPropertyGroups={propertyGroups}
      />
    </main>
  );
}
