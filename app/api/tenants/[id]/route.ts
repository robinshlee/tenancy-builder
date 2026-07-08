import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteTenant, getTenant, updateTenant, type TenantProfileInput } from "@/lib/profiles/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const tenant = await getTenant(supabase, id);
    if (!tenant) return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    return NextResponse.json({ tenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: TenantProfileInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.full_name?.trim() || !body.id_number?.trim()) {
    return NextResponse.json({ error: "Full name and ID number are required." }, { status: 422 });
  }
  try {
    const supabase = await createClient();
    const tenant = await updateTenant(supabase, id, body);
    return NextResponse.json({ tenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await deleteTenant(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
