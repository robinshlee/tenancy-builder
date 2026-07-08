import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteProperty, getProperty, updateProperty, type PropertyProfileInput } from "@/lib/profiles/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const property = await getProperty(supabase, id);
    if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });
    return NextResponse.json({ property });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: PropertyProfileInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.address?.trim()) {
    return NextResponse.json({ error: "Address is required." }, { status: 422 });
  }
  try {
    const supabase = await createClient();
    const property = await updateProperty(supabase, id, body);
    return NextResponse.json({ property });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await deleteProperty(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
