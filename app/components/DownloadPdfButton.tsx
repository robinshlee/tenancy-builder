"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { IconButton } from "@/app/components/IconButton";
import { DownloadIcon } from "@/app/components/icons";

export function DownloadPdfButton({ id, referenceNumber }: { id: string; referenceNumber: string }) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/agreements/${id}/pdf`);
      if (!res.ok) {
        showToast("Something went wrong generating the PDF. Please try again.", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${referenceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Something went wrong generating the PDF. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <IconButton onClick={handleDownload} label="Download PDF" tone="primary" disabled={downloading}>
      <DownloadIcon />
    </IconButton>
  );
}
