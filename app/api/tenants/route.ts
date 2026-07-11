import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTenant, listTenants, type TenantProfileInput } from "@/lib/profiles/server";
import { EMAIL_PATTERN } from "@/lib/agreements/validation";

export async function GET() {
  try {
    const supabase = await createClient();
    const tenants = await listTenants(supabase);
    return NextResponse.json({ tenants });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: TenantProfileInput;
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
    const tenant = await createTenant(supabase, body);
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
