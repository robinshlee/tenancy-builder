import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deletePropertyGroup, getPropertyGroup, updatePropertyGroup, type PropertyGroupInput } from "@/lib/profiles/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const group = await getPropertyGroup(supabase, id);
    if (!group) return NextResponse.json({ error: "Property group not found." }, { status: 404 });
    return NextResponse.json({ group });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: PropertyGroupInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Group name is required." }, { status: 422 });
  }
  try {
    const supabase = await createClient();
    const group = await updatePropertyGroup(supabase, id, body);
    return NextResponse.json({ group });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await deletePropertyGroup(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
