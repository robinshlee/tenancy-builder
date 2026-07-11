import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPropertyGroup, listPropertyGroups, type PropertyGroupInput } from "@/lib/profiles/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const groups = await listPropertyGroups(supabase);
    return NextResponse.json({ groups });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const group = await createPropertyGroup(supabase, body);
    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
