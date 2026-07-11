"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ClauseData = {
  id: string;
  clause_text: string;
  clause_text_review_status: string;
};

const statusStyles: Record<string, string> = {
  unreviewed: "bg-amber-500/15 text-amber-300",
  accepted: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

function ClauseRow({ agreementId, clause }: { agreementId: string; clause: ClauseData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(clause.clause_text);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "reject", clause_text?: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/agreements/${agreementId}/clauses/${clause.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, clause_text }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="border border-white/10 rounded-md p-3 text-sm bg-navy-900/40 space-y-2 text-slate-100">
      {editing ? (
        <textarea
          className="w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <p>{clause.clause_text}</p>
      )}

      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[clause.clause_text_review_status] ?? ""}`}>
          {clause.clause_text_review_status}
        </span>

        {editing ? (
          <>
            <button
              disabled={submitting}
              onClick={() => act("accept", text)}
              className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
            >
              Save &amp; Accept
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-slate-400 hover:underline">
              Cancel
            </button>
          </>
        ) : (
          <>
            {clause.clause_text_review_status !== "accepted" && (
              <button
                disabled={submitting}
                onClick={() => act("accept")}
                className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
              >
                Accept
              </button>
            )}
            <button onClick={() => setEditing(true)} className="text-xs text-slate-300 hover:underline">
              Edit
            </button>
            {clause.clause_text_review_status !== "rejected" && (
              <button
                disabled={submitting}
                onClick={() => act("reject")}
                className="text-xs text-red-400 hover:underline disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </li>
  );
}

export function ClauseReview({ agreementId, clauses }: { agreementId: string; clauses: ClauseData[] }) {
  if (clauses.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">AI-Suggested Clauses</h2>
      <ul className="space-y-2">
        {clauses.map((c) => (
          <ClauseRow key={c.id} agreementId={agreementId} clause={c} />
        ))}
      </ul>
    </div>
  );
}
