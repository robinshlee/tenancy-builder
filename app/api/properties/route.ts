import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProperty, listProperties, type PropertyProfileInput } from "@/lib/profiles/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const properties = await listProperties(supabase);
    return NextResponse.json({ properties });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const property = await createProperty(supabase, body);
    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
