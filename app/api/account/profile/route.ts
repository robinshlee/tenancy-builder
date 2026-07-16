import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateOwnFullName } from "@/lib/account/server";

export async function PATCH(request: Request) {
  let body: { full_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.full_name !== "string" || body.full_name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required." }, { status: 422 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    await updateOwnFullName(supabase, body.full_name.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
