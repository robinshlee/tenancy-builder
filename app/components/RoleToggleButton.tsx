"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/admin/server";

export function RoleToggleButton({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextRole: Role = currentRole === "admin" ? "agent" : "admin";

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={submitting}
        className="text-sm text-neutral-700 hover:underline disabled:opacity-50"
      >
        {submitting ? "Saving…" : nextRole === "admin" ? "Promote to admin" : "Demote to agent"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
