"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@/lib/admin/server";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { BanIcon, CheckCircleIcon } from "@/app/components/icons";

export function StatusActionButton({ userId, currentStatus }: { userId: string; currentStatus: Status }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const nextStatus: Status = currentStatus === "disabled" ? "active" : currentStatus === "pending" ? "active" : "disabled";
  const label = currentStatus === "pending" ? "Approve" : currentStatus === "active" ? "Disable" : "Enable";

  async function handleClick() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Something went wrong. Please try again.", "error");
        return;
      }
      showToast(nextStatus === "active" ? "User approved." : "User disabled.", "success");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IconButton onClick={handleClick} label={label} tone={label === "Disable" ? "danger" : "primary"} disabled={submitting}>
      {label === "Disable" ? <BanIcon /> : <CheckCircleIcon />}
    </IconButton>
  );
}
