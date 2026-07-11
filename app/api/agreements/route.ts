import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AgreementInputError, createAgreement, listAgreements, saveDraftedClauses } from "@/lib/agreements/server";
import { draftClauses } from "@/lib/agreements/clauses";
import { validateAgreementInputs } from "@/lib/agreements/validation";
import type { AgreementFormInput } from "@/lib/agreements/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const agreements = await listAgreements(supabase);
    return NextResponse.json({ agreements });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: AgreementFormInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { errors } = validateAgreementInputs(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", fieldErrors: errors }, { status: 422 });
  }

  try {
    const supabase = await createClient();
    const agreement = await createAgreement(supabase, body);

    // AI clause drafting is optional and must never block agreement creation.
    try {
      const drafted = await draftClauses({
        property_type: body.property.property_type,
        lease_start_date: body.lease_start_date,
        lease_end_date: body.lease_end_date,
        rental_amount: body.rental_amount,
        notes: body.special_conditions,
      });
      await saveDraftedClauses(supabase, agreement.id, drafted);
    } catch (err) {
      console.error("AI clause drafting failed:", err);
    }

    return NextResponse.json({ agreement }, { status: 201 });
  } catch (err) {
    if (err instanceof AgreementInputError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
