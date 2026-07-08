import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteAgreement, getAgreementFull, updateAgreement } from "@/lib/agreements/server";
import { validateAgreementInputs } from "@/lib/agreements/validation";
import type { AgreementFormInput } from "@/lib/agreements/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const agreement = await getAgreementFull(supabase, id);
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found." }, { status: 404 });
    }
    return NextResponse.json({ agreement });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    const agreement = await updateAgreement(supabase, id, body);
    return NextResponse.json({ agreement });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await deleteAgreement(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
