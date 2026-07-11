import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{agreement.reference_number}</h1>
          <p className="text-sm text-slate-400 capitalize">{agreement.status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <DownloadPdfButton id={id} referenceNumber={agreement.reference_number} />
          <Link href={`/agreements/${id}/edit`} className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
            Edit
          </Link>
          <DeleteAgreementButton id={id} />
        </div>
      </div>

      <div className="bg-navy-900/50 border border-white/10 rounded-lg p-4 sm:p-8 text-slate-100 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
        {agreement.generated_text}
      </div>

      <ClauseReview agreementId={id} clauses={agreement.clauses} />
    </main>
  );
}
