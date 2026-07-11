"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/admin/settings";

const COVER_PAGE_TOKENS: { token: string; description: string }[] = [
  { token: "{{tenant_full_name}}", description: "Tenant's full legal name" },
  { token: "{{tenant_id_number}}", description: "Tenant's Ghana Card / ID number" },
  { token: "{{landlord_full_name}}", description: "Landlord's full legal name" },
  { token: "{{landlord_id_number}}", description: "Landlord's Ghana Card / ID number" },
  { token: "{{property_address}}", description: "Full property address" },
  { token: "{{reference_number}}", description: "Agreement reference, e.g. TA-2026-014" },
  { token: "{{rental_amount}}", description: "Monthly rent (GHS)" },
  { token: "{{deposit_amount}}", description: "Security deposit (GHS)" },
  { token: "{{lease_start_date}}", description: "Lease start date" },
  { token: "{{lease_end_date}}", description: "Lease end date" },
  { token: "{{today_date}}", description: "Date the agreement is generated" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function TemplateSettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [letterheadName, setLetterheadName] = useState(settings.letterhead_name ?? "");
  const [boilerplate, setBoilerplate] = useState(settings.boilerplate_clauses ?? "");
  const [schedule, setSchedule] = useState({
    default_notice_period: settings.default_notice_period ?? "",
    default_renewal_terms: settings.default_renewal_terms ?? "",
    default_maintenance_responsibility: settings.default_maintenance_responsibility ?? "",
    default_utilities_responsibility: settings.default_utilities_responsibility ?? "",
    default_inventory_notes: settings.default_inventory_notes ?? "",
  });
  const [savingText, setSavingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textSaved, setTextSaved] = useState(false);

  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverPageUrl, setCoverPageUrl] = useState(settings.cover_page_url);
  const [coverPageFilename, setCoverPageFilename] = useState(settings.cover_page_filename);
  const [coverPageUploadedAt, setCoverPageUploadedAt] = useState(settings.cover_page_uploaded_at);
  const [uploadingCoverPage, setUploadingCoverPage] = useState(false);
  const [coverPageError, setCoverPageError] = useState<string | null>(null);
  const coverPageInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveText(e: React.FormEvent) {
    e.preventDefault();
    setTextError(null);
    setTextSaved(false);
    setSavingText(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterhead_name: letterheadName, boilerplate_clauses: boilerplate, ...schedule }),
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

  async function handleCoverPageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPageError(null);
    setUploadingCoverPage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/settings/cover-page", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCoverPageError(body.error || "Something went wrong. Please try again.");
        return;
      }
      const body = await res.json();
      setCoverPageUrl(body.settings.cover_page_url);
      setCoverPageFilename(body.settings.cover_page_filename);
      setCoverPageUploadedAt(body.settings.cover_page_uploaded_at);
      router.refresh();
    } catch {
      setCoverPageError("Something went wrong. Please try again.");
    } finally {
      setUploadingCoverPage(false);
      if (coverPageInputRef.current) coverPageInputRef.current.value = "";
    }
  }

  async function handleRemoveCoverPage() {
    setCoverPageError(null);
    setUploadingCoverPage(true);
    try {
      const res = await fetch("/api/admin/settings/cover-page", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCoverPageError(body.error || "Something went wrong. Please try again.");
        return;
      }
      setCoverPageUrl(null);
      setCoverPageFilename(null);
      setCoverPageUploadedAt(null);
      router.refresh();
    } catch {
      setCoverPageError("Something went wrong. Please try again.");
    } finally {
      setUploadingCoverPage(false);
    }
  }

  return (
    <div className="space-y-10">
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

      <section className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Cover page</h2>
        <p className="text-sm text-neutral-500">
          Every agreement&apos;s cover page and schedule are still generated automatically from that agreement&apos;s
          own data (see below). If you&apos;ve designed a custom cover page layout, use this guide to prepare it and
          upload it here as a reference — once uploaded, it&apos;s stored and available to view any time.
        </p>

        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 space-y-2">
          <p className="text-sm font-medium text-neutral-800">How to prepare a cover page</p>
          <ol className="text-sm text-neutral-600 list-decimal list-inside space-y-1">
            <li>Design your cover page in Word or as a PDF, using your own branding and layout.</li>
            <li>
              Anywhere you want agreement-specific data to appear, type the exact placeholder tokens below — the app
              already collects all of this data on every agreement.
            </li>
            <li>Upload the finished file below when it&apos;s ready. You can replace it any time.</li>
          </ol>
          <div className="overflow-x-auto mt-2">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-1 pr-4 font-medium">Placeholder</th>
                  <th className="py-1 font-medium">Fills in with</th>
                </tr>
              </thead>
              <tbody>
                {COVER_PAGE_TOKENS.map((t) => (
                  <tr key={t.token} className="border-b border-neutral-100 last:border-0">
                    <td className="py-1 pr-4 font-mono text-neutral-800">{t.token}</td>
                    <td className="py-1 text-neutral-600">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {coverPageUrl ? (
          <div className="rounded-md border border-neutral-200 p-4 flex items-start justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-neutral-900">{coverPageFilename}</p>
              <p className="text-neutral-500">Uploaded {formatDate(coverPageUploadedAt)}</p>
              <a href={coverPageUrl} target="_blank" rel="noreferrer" className="text-neutral-700 underline">
                View file
              </a>
            </div>
            <div className="flex flex-col items-end gap-2">
              <label className="text-sm text-neutral-700 hover:underline cursor-pointer">
                Replace
                <input
                  ref={coverPageInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleCoverPageChange}
                  disabled={uploadingCoverPage}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleRemoveCoverPage}
                disabled={uploadingCoverPage}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="inline-block bg-neutral-900 text-white px-5 py-2.5 rounded-md text-sm hover:bg-neutral-700 cursor-pointer">
              Upload cover page
              <input
                ref={coverPageInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleCoverPageChange}
                disabled={uploadingCoverPage}
                className="hidden"
              />
            </label>
            <p className="text-xs text-neutral-400 mt-2">PDF or Word (.pdf, .doc, .docx), up to 10MB.</p>
          </div>
        )}
        {uploadingCoverPage && <p className="text-sm text-neutral-500">Working…</p>}
        {coverPageError && <p className="text-sm text-red-600">{coverPageError}</p>}
      </section>

      <form onSubmit={handleSaveText} className="space-y-8">
        {textError && <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{textError}</div>}
        {textSaved && <div className="rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">Saved.</div>}

        <div className="space-y-3">
          <h2 className="font-semibold text-neutral-900">Letterhead &amp; additional notes</h2>
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
            Additional schedule notes (optional, appended after the standard lease terms below)
            <textarea
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[120px]"
              value={boilerplate}
              onChange={(e) => setBoilerplate(e.target.value)}
              placeholder={"One note per line, e.g.\nNo pets without written consent."}
            />
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-neutral-900">Schedule defaults</h2>
          <p className="text-sm text-neutral-500">
            Standard lease terms used to pre-fill every new agreement&apos;s Schedule. Agents can still edit these
            per agreement.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm">
              Notice period
              <textarea
                className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[60px]"
                value={schedule.default_notice_period}
                onChange={(e) => setSchedule((s) => ({ ...s, default_notice_period: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Renewal / termination terms
              <textarea
                className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[60px]"
                value={schedule.default_renewal_terms}
                onChange={(e) => setSchedule((s) => ({ ...s, default_renewal_terms: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Maintenance &amp; repair responsibilities
              <textarea
                className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[60px]"
                value={schedule.default_maintenance_responsibility}
                onChange={(e) => setSchedule((s) => ({ ...s, default_maintenance_responsibility: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Utilities responsibility
              <textarea
                className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[60px]"
                value={schedule.default_utilities_responsibility}
                onChange={(e) => setSchedule((s) => ({ ...s, default_utilities_responsibility: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              Inventory / condition notes
              <textarea
                className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 min-h-[60px]"
                value={schedule.default_inventory_notes}
                onChange={(e) => setSchedule((s) => ({ ...s, default_inventory_notes: e.target.value }))}
              />
            </label>
          </div>
        </div>

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
