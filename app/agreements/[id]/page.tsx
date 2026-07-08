import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
import { Nav } from "@/app/components/Nav";
import { DeleteAgreementButton } from "@/app/components/DeleteAgreementButton";

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
            <Link href={`/agreements/${id}/edit`} className="text-sm text-neutral-700 hover:underline">
              Edit
            </Link>
            <DeleteAgreementButton id={id} />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-8 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {agreement.generated_text}
        </div>

        {agreement.clauses.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">AI-Suggested Clauses</h2>
            <ul className="space-y-2">
              {agreement.clauses.map((c) => (
                <li key={c.id} className="border border-neutral-200 rounded-md p-3 text-sm bg-white">
                  <p>{c.clause_text}</p>
                  <p className="text-xs text-neutral-500 mt-1 capitalize">Status: {c.clause_text_review_status}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
