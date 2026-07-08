import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAgreement, listAgreements } from "@/lib/agreements/server";
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
    return NextResponse.json({ agreement }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
