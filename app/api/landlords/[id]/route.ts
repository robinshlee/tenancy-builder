import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteLandlord, getLandlord, updateLandlord, type LandlordProfileInput } from "@/lib/profiles/server";
import { EMAIL_PATTERN } from "@/lib/agreements/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const landlord = await getLandlord(supabase, id);
    if (!landlord) return NextResponse.json({ error: "Landlord not found." }, { status: 404 });
    return NextResponse.json({ landlord });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: LandlordProfileInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.full_name?.trim() || !body.id_number?.trim()) {
    return NextResponse.json({ error: "Full name and ID number are required." }, { status: 422 });
  }
  if (body.email?.trim() && !EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json({ error: "Email address is not valid." }, { status: 422 });
  }
  try {
    const supabase = await createClient();
    const landlord = await updateLandlord(supabase, id, body);
    return NextResponse.json({ landlord });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await deleteLandlord(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
