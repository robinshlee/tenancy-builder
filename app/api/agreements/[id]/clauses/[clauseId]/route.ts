import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewClause } from "@/lib/agreements/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; clauseId: string }> }) {
  const { id, clauseId } = await params;

  let body: { action?: "accept" | "reject"; clause_text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action !== "accept" && body.action !== "reject") {
    return NextResponse.json({ error: "action must be 'accept' or 'reject'." }, { status: 422 });
  }

  try {
    const supabase = await createClient();
    const agreement = await reviewClause(supabase, id, clauseId, body.action, body.clause_text);
    return NextResponse.json({ agreement });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
