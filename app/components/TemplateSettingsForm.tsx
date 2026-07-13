"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_KINDS, DOCUMENT_LABELS, documentInfo, type AppSettings, type DocumentKind } from "@/lib/admin/settings";

const TABS = ["General", "Cover", "Body", "Schedule", "Signing", "Document order"] as const;
type Tab = (typeof TABS)[number];

const CONDITIONAL_GUIDANCE = (
  <div className="rounded-md border border-teal-400/20 bg-teal-500/5 p-4 space-y-2">
    <p className="text-sm font-medium text-white">Avoiding gaps for a 2nd / 3rd tenant</p>
    <p className="text-sm text-slate-300">
      An agreement can have up to 3 tenants, but most only have 1. To stop your layout leaving a blank gap when
      tenant 2 or 3 doesn&apos;t exist, wrap each optional tenant&apos;s block in a conditional tag when you prepare
      your Word document, e.g.:
    </p>
    <pre className="text-xs bg-navy-950/60 border border-white/10 rounded-md p-3 text-slate-300 overflow-x-auto">
{`{{#tenant2}}
AND
{{tenant2_full_name}} (NRIC: {{tenant2_id_number}})
{{/tenant2}}`}
    </pre>
    <p className="text-sm text-slate-300">
      Today, Word&apos;s own conditional/IF fields (Insert → Quick Parts → Field → IF) can drive this by hand per
      agreement. This <code className="font-mono text-teal-300">{"{{#tenant2}}...{{/tenant2}}"}</code> tag style is
      the convention we&apos;d recognise automatically once the app supports live document merging — using it now
      keeps your file ready for that.
    </p>
  </div>
);

const COVER_PAGE_CONTENTS: { field: string; source: string }[] = [
  { field: "Title", source: '"TENANCY AGREEMENT" (fixed)' },
  { field: "Landlord name", source: "From the landlord attached to the agreement" },
  { field: "Landlord NRIC", source: "From the landlord's ID number on file" },
  { field: "Tenant name(s)", source: "From the tenant(s) attached to the agreement (1–3)" },
  { field: "Tenant NRIC(s)", source: "From each tenant's ID number on file" },
  { field: "Property address", source: "From the selected property" },
];

const COVER_PAGE_TOKENS: { token: string; description: string }[] = [
  { token: "{{tenant_full_name}}", description: "1st tenant's full legal name" },
  { token: "{{tenant_id_number}}", description: "1st tenant's NRIC / ID number" },
  { token: "{{tenant2_full_name}}", description: "2nd tenant's full legal name (if any)" },
  { token: "{{tenant2_id_number}}", description: "2nd tenant's NRIC / ID number (if any)" },
  { token: "{{tenant3_full_name}}", description: "3rd tenant's full legal name (if any)" },
  { token: "{{tenant3_id_number}}", description: "3rd tenant's NRIC / ID number (if any)" },
  { token: "{{landlord_full_name}}", description: "Landlord's full legal name" },
  { token: "{{landlord_id_number}}", description: "Landlord's NRIC / ID number" },
  { token: "{{property_address}}", description: "Full property address" },
  { token: "{{reference_number}}", description: "Agreement reference, e.g. TA-2026-014" },
  { token: "{{rental_amount}}", description: "Monthly rent (RM)" },
  { token: "{{deposit_amount}}", description: "Security deposit (RM)" },
  { token: "{{lease_start_date}}", description: "Lease start date" },
  { token: "{{lease_end_date}}", description: "Lease end date" },
  { token: "{{today_date}}", description: "Date the agreement is generated" },
];

const SCHEDULE_CONTENTS: { field: string; source: string }[] = [
  { field: "Day and year of agreement", source: "Lease start date" },
  { field: "Landlord name, NRIC, address", source: "From the landlord attached to the agreement" },
  { field: "Tenant(s) name, NRIC, address", source: "From the tenant(s) attached to the agreement (1–3)" },
  { field: "Description of premises", source: "From the selected property" },
  { field: "Term of lease", source: "Lease start / end dates" },
  { field: "Rental + payment details", source: "Monthly rent, payment due day, and Rent payment details (below)" },
  { field: "Rental / utility deposit", source: "Deposit amount + Utility deposit (below)" },
  { field: "Access card / deposit terms", source: "Set below (admin default, editable per agreement)" },
  { field: "Use of premises", source: "Set below (admin default, editable per agreement)" },
  { field: "Option / renewal", source: "Set below (admin default, editable per agreement)" },
  { field: "Special conditions", source: "Entered per agreement (Deal terms section)" },
];

const SCHEDULE_TOKENS: { token: string; description: string }[] = [
  { token: "{{use_of_premises}}", description: "Use of premises, e.g. \"Residential purposes only.\"" },
  { token: "{{renewal_terms}}", description: "Option / renewal terms" },
  { token: "{{rent_payment_details}}", description: "Bank account details for rent payment" },
  { token: "{{utility_deposit_amount}}", description: "Utility deposit (RM)" },
  { token: "{{access_card_deposit_notes}}", description: "Access card / deposit terms" },
  { token: "{{special_conditions}}", description: "Special conditions entered on the agreement" },
  { token: "{{tenant_full_name}} / {{tenant2_full_name}} / {{tenant3_full_name}}", description: "Tenant name(s), 2nd/3rd if any" },
  { token: "{{tenant_id_number}} / {{tenant2_id_number}} / {{tenant3_id_number}}", description: "Tenant NRIC(s), 2nd/3rd if any" },
];

const SIGNING_CONTENTS: { field: string; source: string }[] = [
  { field: "Landlord signature line", source: "Landlord's full legal name + NRIC" },
  { field: "Tenant signature line(s)", source: "Each tenant's full legal name + NRIC (1–3)" },
  { field: "Witness line(s)", source: "Not collected by the app — filled in by hand at signing" },
];

const SIGNING_TOKENS: { token: string; description: string }[] = [
  { token: "{{landlord_full_name}}", description: "Landlord's full legal name" },
  { token: "{{landlord_id_number}}", description: "Landlord's NRIC / ID number" },
  { token: "{{tenant_full_name}}", description: "1st tenant's full legal name" },
  { token: "{{tenant_id_number}}", description: "1st tenant's NRIC / ID number" },
  { token: "{{tenant2_full_name}}", description: "2nd tenant's full legal name (if any)" },
  { token: "{{tenant2_id_number}}", description: "2nd tenant's NRIC / ID number (if any)" },
  { token: "{{tenant3_full_name}}", description: "3rd tenant's full legal name (if any)" },
  { token: "{{tenant3_id_number}}", description: "3rd tenant's NRIC / ID number (if any)" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function TokenTable({ rows, headers }: { rows: { token: string; description: string }[]; headers: [string, string] }) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="text-left text-slate-400 border-b border-white/10">
            <th className="py-1 pr-4 font-medium">{headers[0]}</th>
            <th className="py-1 font-medium">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.token} className="border-b border-white/5 last:border-0">
              <td className="py-1 pr-4 font-mono text-white whitespace-nowrap">{r.token}</td>
              <td className="py-1 text-slate-300">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentsTable({ rows }: { rows: { field: string; source: string }[] }) {
  return (
    <div className="rounded-md border border-white/10 bg-navy-900/40 p-4">
      <div className="overflow-x-auto">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="py-1 pr-4 font-medium">Field</th>
              <th className="py-1 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.field} className="border-b border-white/5 last:border-0">
                <td className="py-1 pr-4 text-white">{c.field}</td>
                <td className="py-1 text-slate-300">{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentUploadCard({
  kind,
  settings,
  onUpdated,
}: {
  kind: DocumentKind;
  settings: AppSettings;
  onUpdated: (settings: AppSettings) => void;
}) {
  const router = useRouter();
  const info = documentInfo(settings, kind);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/settings/document/${kind}`, { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        return;
      }
      const body = await res.json();
      onUpdated(body.settings);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      const res = await fetch(`/api/admin/settings/document/${kind}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        return;
      }
      const body = await res.json();
      onUpdated(body.settings);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const acceptTypes =
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <div>
      {info.url ? (
        <div className="rounded-md border border-white/10 p-4 flex items-start justify-between gap-4">
          <div className="text-sm">
            <p className="font-medium text-white">{info.filename}</p>
            <p className="text-slate-400">Uploaded {formatDate(info.uploadedAt)}</p>
            <a href={info.url} target="_blank" rel="noreferrer" className="text-teal-300 hover:text-teal-200 underline">
              View file
            </a>
          </div>
          <div className="flex flex-col items-end gap-2">
            <label className="text-sm text-teal-300 hover:text-teal-200 hover:underline cursor-pointer">
              Replace
              <input ref={inputRef} type="file" accept={acceptTypes} onChange={handleChange} disabled={uploading} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-xs text-red-400 hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="inline-block bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 cursor-pointer transition-colors">
            Upload {DOCUMENT_LABELS[kind].toLowerCase()}
            <input ref={inputRef} type="file" accept={acceptTypes} onChange={handleChange} disabled={uploading} className="hidden" />
          </label>
          <p className="text-xs text-slate-500 mt-2">PDF or Word (.pdf, .doc, .docx), up to 10MB.</p>
        </div>
      )}
      {uploading && <p className="text-sm text-slate-400 mt-2">Working…</p>}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}

function DocumentOrderEditor({ settings, onUpdated }: { settings: AppSettings; onUpdated: (settings: AppSettings) => void }) {
  const router = useRouter();
  const [order, setOrder] = useState<DocumentKind[]>(settings.document_order ?? DOCUMENT_KINDS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function move(index: number, direction: -1 | 1) {
    setSaved(false);
    setOrder((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_order: order }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Something went wrong. Please try again.");
        return;
      }
      const body = await res.json();
      onUpdated(body.settings);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        The order these four documents should be assembled in for the final signed agreement — used as your own
        reference when combining the uploaded files (or printing them together).
      </p>
      <ol className="space-y-2">
        {order.map((kind, i) => (
          <li key={kind} className="flex items-center justify-between rounded-md border border-white/10 bg-navy-900/40 px-4 py-2.5">
            <span className="text-sm text-white">
              {i + 1}. {DOCUMENT_LABELS[kind]}
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${DOCUMENT_LABELS[kind]} up`}
                className="w-7 h-7 rounded-md border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={`Move ${DOCUMENT_LABELS[kind]} down`}
                className="w-7 h-7 rounded-md border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30"
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Saved.</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Save order"}
      </button>
    </div>
  );
}

export function TemplateSettingsForm({ settings: initialSettings }: { settings: AppSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [tab, setTab] = useState<Tab>("General");

  const [letterheadName, setLetterheadName] = useState(initialSettings.letterhead_name ?? "");
  const [boilerplate, setBoilerplate] = useState(initialSettings.boilerplate_clauses ?? "");
  const [schedule, setSchedule] = useState({
    default_use_of_premises: initialSettings.default_use_of_premises ?? "",
    default_renewal_terms: initialSettings.default_renewal_terms ?? "",
    default_rent_payment_details: initialSettings.default_rent_payment_details ?? "",
    default_access_card_deposit_notes: initialSettings.default_access_card_deposit_notes ?? "",
  });
  const [savingText, setSavingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textSaved, setTextSaved] = useState(false);

  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t ? "bg-navy-900/60 text-white border border-b-0 border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <div className="space-y-10">
          <section className="space-y-3">
            <h2 className="font-semibold text-white">Logo / letterhead image</h2>
            <p className="text-sm text-slate-400">Appears on the cover page of every generated agreement (preview and PDF).</p>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Current logo" className="h-16 border border-white/15 rounded-md bg-navy-900/40 p-2" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              disabled={uploadingLogo}
              className="block text-sm"
            />
            <p className="text-xs text-slate-500">PNG, JPEG, or WebP — SVG isn&apos;t supported in the PDF renderer.</p>
            {uploadingLogo && <p className="text-sm text-slate-400">Uploading…</p>}
            {logoError && <p className="text-sm text-red-400">{logoError}</p>}
          </section>

          <form onSubmit={handleSaveText} className="space-y-8">
            {textError && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">{textError}</div>
            )}
            {textSaved && (
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 text-sm">Saved.</div>
            )}

            <div className="space-y-3">
              <h2 className="font-semibold text-white">Letterhead &amp; additional notes</h2>
              <label className="block text-sm">
                Letterhead name (shown next to the logo)
                <input
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                  value={letterheadName}
                  onChange={(e) => setLetterheadName(e.target.value)}
                  placeholder="e.g. Acme Property Management"
                />
              </label>
              <label className="block text-sm">
                Additional schedule notes (optional, appended after the standard lease terms below)
                <textarea
                  className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[120px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                  value={boilerplate}
                  onChange={(e) => setBoilerplate(e.target.value)}
                  placeholder={"One note per line, e.g.\nNo pets without written consent."}
                />
              </label>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-white">Schedule defaults</h2>
              <p className="text-sm text-slate-400">
                Standard lease terms used to pre-fill every new agreement&apos;s Schedule. Agents can still edit these
                per agreement.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm">
                  Use of premises
                  <textarea
                    className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    value={schedule.default_use_of_premises}
                    onChange={(e) => setSchedule((s) => ({ ...s, default_use_of_premises: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  Renewal / option
                  <textarea
                    className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    value={schedule.default_renewal_terms}
                    onChange={(e) => setSchedule((s) => ({ ...s, default_renewal_terms: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  Rent payment details (bank account, etc.)
                  <textarea
                    className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    value={schedule.default_rent_payment_details}
                    onChange={(e) => setSchedule((s) => ({ ...s, default_rent_payment_details: e.target.value }))}
                    placeholder="e.g. Maybank Ac 157018646512, ACME PROPERTIES SDN BHD"
                  />
                </label>
                <label className="text-sm">
                  Access card / deposit terms
                  <textarea
                    className="mt-1 w-full border border-white/15 rounded-md px-3 py-2 min-h-[60px] bg-navy-800/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    value={schedule.default_access_card_deposit_notes}
                    onChange={(e) => setSchedule((s) => ({ ...s, default_access_card_deposit_notes: e.target.value }))}
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Utility deposit is entered as a specific amount per agreement (see the Schedule section on each
                  agreement) since it varies with each landlord&apos;s requirements — there&apos;s no firm-wide default.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingText}
              className="bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-teal-400 disabled:opacity-50 transition-colors"
            >
              {savingText ? "Saving…" : "Save"}
            </button>
          </form>
        </div>
      )}

      {tab === "Cover" && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Cover page</h2>
          <p className="text-sm text-slate-400">
            Every agreement&apos;s cover page is generated automatically — no separate data entry needed. Here&apos;s
            exactly what appears on it and where each piece comes from:
          </p>
          <ContentsTable rows={COVER_PAGE_CONTENTS} />
          <p className="text-sm text-slate-400">
            If you&apos;d rather use your own branded cover page layout instead of the plain auto-generated one,
            prepare it with the placeholder tokens below and upload it here as a reference.
          </p>
          <div className="rounded-md border border-white/10 bg-navy-900/40 p-4 space-y-2">
            <p className="text-sm font-medium text-white">How to prepare a custom cover page</p>
            <ol className="text-sm text-slate-300 list-decimal list-inside space-y-1">
              <li>Design your cover page in Word or as a PDF, using your own branding and layout.</li>
              <li>
                Anywhere you want agreement-specific data to appear, type the exact placeholder tokens below — the
                app already collects all of this data on every agreement.
              </li>
              <li>Upload the finished file below when it&apos;s ready. You can replace it any time.</li>
            </ol>
            <TokenTable rows={COVER_PAGE_TOKENS} headers={["Placeholder", "Fills in with"]} />
          </div>
          {CONDITIONAL_GUIDANCE}
          <DocumentUploadCard kind="cover" settings={settings} onUpdated={setSettings} />
        </section>
      )}

      {tab === "Body" && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Body</h2>
          <p className="text-sm text-slate-400">
            The body is the fixed legal boilerplate — the numbered landlord/tenant covenants — that&apos;s the same
            for every agreement. It doesn&apos;t vary per agreement, so there&apos;s nothing to fill in; the app
            already includes an equivalent set of standard terms in every generated agreement&apos;s TERMS section.
          </p>
          <div className="rounded-md border border-white/10 bg-navy-900/40 p-4 space-y-2">
            <p className="text-sm font-medium text-white">Using your own body text</p>
            <p className="text-sm text-slate-300">
              If you have your own precise legal wording (e.g. drafted by your lawyer) that you&apos;d rather use
              as the authoritative body text, upload it below as a reference. It contains no placeholders since it
              doesn&apos;t change between agreements.
            </p>
          </div>
          <DocumentUploadCard kind="body" settings={settings} onUpdated={setSettings} />
        </section>
      )}

      {tab === "Schedule" && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Schedule</h2>
          <p className="text-sm text-slate-400">
            Every agreement&apos;s Schedule is generated automatically from a mix of data already collected
            elsewhere and the Schedule fields below. Here&apos;s what maps to what:
          </p>
          <ContentsTable rows={SCHEDULE_CONTENTS} />
          <p className="text-sm text-slate-400">
            If you&apos;d rather use your own Schedule table layout, prepare it with the placeholder tokens below and
            upload it here as a reference.
          </p>
          <div className="rounded-md border border-white/10 bg-navy-900/40 p-4 space-y-2">
            <p className="text-sm font-medium text-white">Schedule placeholders</p>
            <TokenTable rows={SCHEDULE_TOKENS} headers={["Placeholder", "Fills in with"]} />
          </div>
          {CONDITIONAL_GUIDANCE}
          <DocumentUploadCard kind="schedule" settings={settings} onUpdated={setSettings} />
        </section>
      )}

      {tab === "Signing" && (
        <section className="space-y-3">
          <h2 className="font-semibold text-white">Signing page</h2>
          <p className="text-sm text-slate-400">
            The signing page is the signature block — one signature line per party, witnessed. Here&apos;s what
            appears on it and where each piece comes from:
          </p>
          <ContentsTable rows={SIGNING_CONTENTS} />
          <p className="text-sm text-slate-400">
            If you&apos;d rather use your own signing page layout, prepare it with the placeholder tokens below and
            upload it here as a reference.
          </p>
          <div className="rounded-md border border-white/10 bg-navy-900/40 p-4 space-y-2">
            <p className="text-sm font-medium text-white">Signing page placeholders</p>
            <TokenTable rows={SIGNING_TOKENS} headers={["Placeholder", "Fills in with"]} />
          </div>
          {CONDITIONAL_GUIDANCE}
          <DocumentUploadCard kind="signing" settings={settings} onUpdated={setSettings} />
        </section>
      )}

      {tab === "Document order" && <DocumentOrderEditor settings={settings} onUpdated={setSettings} />}
    </div>
  );
}
