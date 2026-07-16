"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/admin/server";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { ShieldDownIcon, ShieldUpIcon } from "@/app/components/icons";

export function RoleToggleButton({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const nextRole: Role = currentRole === "admin" ? "agent" : "admin";
  const label = nextRole === "admin" ? "Promote to admin" : "Demote to agent";

  async function handleClick() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Something went wrong. Please try again.", "error");
        return;
      }
      showToast(nextRole === "admin" ? "Promoted to admin." : "Demoted to agent.", "success");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IconButton onClick={handleClick} label={label} disabled={submitting}>
      {nextRole === "admin" ? <ShieldUpIcon /> : <ShieldDownIcon />}
    </IconButton>
  );
}
