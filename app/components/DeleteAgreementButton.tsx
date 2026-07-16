"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { DeleteIcon } from "@/app/components/icons";

export function DeleteAgreementButton({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/agreements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Something went wrong. Please try again.", "error");
        return;
      }
      showToast("Agreement deleted.", "success");
      router.push("/agreements");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <IconButton onClick={() => setConfirming(true)} label="Delete agreement" tone="danger">
        <DeleteIcon />
      </IconButton>
      <ConfirmDialog
        open={confirming}
        title="Delete this agreement?"
        message="This will permanently delete the agreement. This can't be undone."
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
