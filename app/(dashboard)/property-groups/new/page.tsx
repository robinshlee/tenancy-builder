import { PropertyGroupForm } from "@/app/components/PropertyGroupForm";

export default function NewPropertyGroupPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">New Property Group</h1>
      <PropertyGroupForm mode="create" initialValues={{ name: "", address: "", city: "" }} />
    </main>
  );
}
