import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
import { listLandlords, listProperties, listTenants } from "@/lib/profiles/server";
import { Nav } from "@/app/components/Nav";
import { AgreementForm, type AgreementFormValues } from "@/app/components/AgreementForm";

export default async function EditAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let agreement;
  try {
    agreement = await getAgreementFull(supabase, id);
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong loading this agreement.");
  }

  if (!agreement) {
    notFound();
  }

  const [landlords, tenants, properties] = await Promise.all([
    listLandlords(supabase),
    listTenants(supabase),
    listProperties(supabase),
  ]);

  const initialValues: AgreementFormValues = {
    landlords: agreement.landlords.map((l) => ({
      id: l.id,
      full_name: l.full_name,
      id_number: l.id_number,
      phone: l.phone ?? "",
      email: l.email ?? "",
      address: l.address ?? "",
    })),
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
      description: agreement.property.description ?? "",
    },
    rental_amount: String(agreement.rental_amount),
    deposit_amount: agreement.deposit_amount != null ? String(agreement.deposit_amount) : "",
    lease_start_date: agreement.lease_start_date,
    lease_end_date: agreement.lease_end_date,
    payment_due_day: String(agreement.payment_due_day),
    special_conditions: agreement.special_conditions ?? "",
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Edit {agreement.reference_number}</h1>
        <AgreementForm
          mode="edit"
          agreementId={id}
          initialValues={initialValues}
          existingLandlords={landlords}
          existingTenants={tenants}
          existingProperties={properties}
        />
      </main>
    </div>
  );
}
