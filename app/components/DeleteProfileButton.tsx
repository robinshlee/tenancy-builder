"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { DeleteIcon } from "@/app/components/icons";

export function DeleteProfileButton({ apiPath, label = "this record" }: { apiPath: string; label?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(apiPath, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Something went wrong. Please try again.", "error");
        return;
      }
      showToast(`Deleted ${label}.`, "success");
      setConfirming(false);
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <IconButton onClick={() => setConfirming(true)} label={`Delete ${label}`} tone="danger">
        <DeleteIcon />
      </IconButton>
      <ConfirmDialog
        open={confirming}
        title="Delete this record?"
        message={`This will permanently delete ${label}. This can't be undone.`}
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
