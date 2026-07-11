import { PropertyForm } from "@/app/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Property</h1>
      <PropertyForm
        mode="create"
        initialValues={{
          address: "",
          suburb: "",
          city: "",
          postal_code: "",
          property_type: "",
          bedrooms: "",
          description: "",
        }}
      />
    </main>
  );
}
