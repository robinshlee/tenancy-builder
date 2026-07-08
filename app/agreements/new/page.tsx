import { Nav } from "@/app/components/Nav";
import { AgreementForm, emptyFormValues } from "@/app/components/AgreementForm";

export default function NewAgreementPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">New Agreement</h1>
        <AgreementForm mode="create" initialValues={emptyFormValues} />
      </main>
    </div>
  );
}
