import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAgreementFull } from "@/lib/agreements/server";
import { renderAgreementPdf } from "@/lib/agreements/pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const agreement = await getAgreementFull(supabase, id);
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found." }, { status: 404 });
    }

    const pdfBuffer = await renderAgreementPdf(agreement);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${agreement.reference_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong generating the PDF. Please try again." }, { status: 500 });
  }
}
