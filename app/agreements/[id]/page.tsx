import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
import { Nav } from "@/app/components/Nav";
import { DeleteAgreementButton } from "@/app/components/DeleteAgreementButton";
import { DownloadPdfButton } from "@/app/components/DownloadPdfButton";
import { ClauseReview } from "@/app/components/ClauseReview";

export default async function AgreementPreviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{agreement.reference_number}</h1>
            <p className="text-sm text-neutral-500 capitalize">{agreement.status}</p>
          </div>
          <div className="flex items-center gap-4">
            <DownloadPdfButton id={id} referenceNumber={agreement.reference_number} />
            <Link href={`/agreements/${id}/edit`} className="text-sm text-neutral-700 hover:underline">
              Edit
            </Link>
            <DeleteAgreementButton id={id} />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-8 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {agreement.generated_text}
        </div>

        <ClauseReview agreementId={id} clauses={agreement.clauses} />
      </main>
    </div>
  );
}
