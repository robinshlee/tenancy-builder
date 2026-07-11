"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProfileButton({ apiPath, label = "this record" }: { apiPath: string; label?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(apiPath, { method: "DELETE" });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="text-slate-300">Delete {label}?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 font-medium hover:underline disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Confirm"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-slate-400 hover:underline">
          Cancel
        </button>
        {error && <span className="text-red-400">{error}</span>}
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-sm text-red-400 hover:underline">
      Delete
    </button>
  );
}
