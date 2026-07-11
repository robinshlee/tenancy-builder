"use client";

import { useState } from "react";

export function DownloadPdfButton({ id, referenceNumber }: { id: string; referenceNumber: string }) {
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agreements/${id}/pdf`);
      if (!res.ok) {
        setError("Something went wrong generating the PDF. Please try again.");
        setDownloading(false);
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
      setError("Something went wrong generating the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="text-sm border border-white/15 text-slate-200 px-3 py-1.5 rounded-md hover:bg-white/5 disabled:opacity-50"
      >
        {downloading ? "Preparing…" : "Download PDF"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
