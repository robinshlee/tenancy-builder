"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { CheckCircleIcon, KeyIcon } from "@/app/components/icons";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Something went wrong. Please try again.", "error");
        return;
      }
      showToast("Password reset email sent.", "success");
      setSent(true);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <IconButton label="Reset email sent" tone="primary" disabled>
        <CheckCircleIcon />
      </IconButton>
    );
  }

  return (
    <IconButton onClick={handleClick} label="Reset password" disabled={submitting}>
      <KeyIcon />
    </IconButton>
  );
}
