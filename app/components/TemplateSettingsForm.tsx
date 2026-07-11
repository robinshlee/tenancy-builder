"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/admin/settings";

export function TemplateSettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [letterheadName, setLetterheadName] = useState(settings.letterhead_name ?? "");
  const [boilerplate, setBoilerplate] = useState(settings.boilerplate_clauses ?? "");
  const [savingText, setSavingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textSaved, setTextSaved] = useState(false);

  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveText(e: React.FormEvent) {
    e.preventDefault();
    setTextError(null);
    setTextSaved(false);
    setSavingText(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterhead_name: letterheadName, boilerplate_clauses: boilerplate }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setTextError(body.error || "Something went wrong. Please try again.");
        return;
      }
      setTextSaved(true);
      router.refresh();
    } catch {
      setTextError("Something went wrong. Please try again.");
    } finally {
      setSavingText(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/settings/logo", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setLogoError(body.error || "Something went wrong. Please try again.");
        return;
      }
      const body = await res.json();
      setLogoUrl(body.settings.logo_url);
      router.refresh();
    } catch {
      setLogoError("Something went wrong. Please try again.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Logo / letterhead image</h2>
        <p className="text-sm text-neutral-500">
          Appears on the cover page of every generated agreement (preview and PDF).
        </p>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Current logo" className="h-16 border border-neutral-200 rounded-md bg-white p-2" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleLogoChange}
          disabled={uploadingLogo}
          className="block text-sm"
        />
        <p className="text-xs text-neutral-400">PNG, JPEG, or WebP — SVG isn&apos;t supported in the PDF renderer.</p>
        {uploadingLogo && <p className="text-sm text-neutral-500">Uploading…</p>}
        {logoError && <p className="text-sm text-red-600">{logoError}</p>}
      </section>

      <form onSubmit={handleSaveText} className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Cover page &amp; schedule text</h2>
        {textError && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{textError}</div>}
        {textSaved && <div className="rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">Saved.</div>}
        <label className="block text-sm">
          Letterhead name (shown next to the logo)
          <input
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2"
            value={letterheadName}
            onChange={(e) => setLetterheadName(e.target.value)}
            placeholder="e.g. Acme Property Management"
          />
        </label>
        <label className="block text-sm">
          Boilerplate clauses (appended to every agreement&apos;s schedule)
          <textarea
            className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[200px]"
            value={boilerplate}
            onChange={(e) => setBoilerplate(e.target.value)}
            placeholder={"One clause per line, e.g.\nNo pets without written consent.\nTenant covers own utility bills."}
          />
        </label>
        <button
          type="submit"
          disabled={savingText}
          className="bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm hover:bg-neutral-700 disabled:opacity-50"
        >
          {savingText ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
