import { createClient } from "@/lib/supabase/server";
import { listLandlords, listProperties, listPropertyGroups, listTenants } from "@/lib/profiles/server";
import { getAppSettings } from "@/lib/admin/settings";
import { AgreementForm } from "@/app/components/AgreementForm";
import { emptyFormValues } from "@/app/components/agreementFormShared";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Agreement" };

export default async function NewAgreementPage() {
  const supabase = await createClient();
  const [landlords, tenants, properties, propertyGroups, settings] = await Promise.all([
    listLandlords(supabase),
    listTenants(supabase),
    listProperties(supabase),
    listPropertyGroups(supabase),
    getAppSettings(supabase),
  ]);

  const initialValues = {
    ...emptyFormValues,
    schedule: {
      use_of_premises: settings.default_use_of_premises ?? "",
      renewal_terms: settings.default_renewal_terms ?? "",
      rent_payment_details: settings.default_rent_payment_details ?? "",
      utility_deposit_amount: "",
      access_card_deposit_notes: settings.default_access_card_deposit_notes ?? "",
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Agreement</h1>
      <AgreementForm
        mode="create"
        initialValues={initialValues}
        existingLandlords={landlords}
        existingTenants={tenants}
        existingProperties={properties}
        existingPropertyGroups={propertyGroups}
      />
    </main>
  );
}
