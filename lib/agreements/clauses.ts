export type DraftedClause = {
  clause_text: string;
  confidence: number;
};

const MODEL = "gpt-4o-mini";

/**
 * Drafts up to 3 special-condition suggestions from an OpenAI chat completion.
 * Returns [] (never throws) when no API key is configured or the call fails —
 * the AI layer is optional and must never block agreement creation.
 */
export async function draftClauses(input: {
  property_type?: string | null;
  lease_start_date: string;
  lease_end_date: string;
  rental_amount: number;
  notes?: string | null;
}): Promise<DraftedClause[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const months = monthsBetween(input.lease_start_date, input.lease_end_date);

  const prompt = [
    "You are drafting optional special conditions for a residential tenancy agreement.",
    `Property type: ${input.property_type || "unspecified"}`,
    `Lease duration: ${months} months`,
    `Monthly rent: GHS ${input.rental_amount}`,
    input.notes ? `Agent notes: ${input.notes}` : "Agent notes: none",
    "Suggest exactly 3 short, plain-English special conditions an agent might add to this agreement.",
    'Respond with strict JSON only: {"clauses": [{"text": string, "confidence": number between 0 and 1}, ...]}',
  ].join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const clauses = Array.isArray(parsed?.clauses) ? parsed.clauses : [];

    return clauses
      .filter((c: unknown): c is { text: string; confidence?: number } => !!c && typeof (c as { text?: unknown }).text === "string")
      .slice(0, 3)
      .map((c: { text: string; confidence?: number }) => ({
        clause_text: c.text,
        confidence: typeof c.confidence === "number" ? Math.max(0, Math.min(1, c.confidence)) : 0.5,
      }));
  } catch (err) {
    console.error("draftClauses failed:", err);
    return [];
  }
}

function monthsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}
