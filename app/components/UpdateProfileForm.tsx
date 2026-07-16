"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

export function UpdateProfileForm({ initialFullName }: { initialFullName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullName.trim().length === 0) {
      showToast("Name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      showToast("Profile updated.");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm text-slate-300">
        Full name
        <input
          type="text"
          className="mt-1 w-full rounded-md bg-white px-3 py-2.5 text-navy-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
