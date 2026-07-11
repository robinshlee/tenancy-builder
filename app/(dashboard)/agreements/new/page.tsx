import { createClient } from "@/lib/supabase/server";
import { listLandlords, listProperties, listPropertyGroups, listTenants } from "@/lib/profiles/server";
import { getAppSettings } from "@/lib/admin/settings";
import { AgreementForm } from "@/app/components/AgreementForm";
import { emptyFormValues } from "@/app/components/agreementFormShared";

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
      notice_period: settings.default_notice_period ?? "",
      renewal_terms: settings.default_renewal_terms ?? "",
      maintenance_responsibility: settings.default_maintenance_responsibility ?? "",
      utilities_responsibility: settings.default_utilities_responsibility ?? "",
      inventory_notes: settings.default_inventory_notes ?? "",
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
