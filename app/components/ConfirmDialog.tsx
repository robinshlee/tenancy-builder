"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirming,
  danger,
  hideCancel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  danger?: boolean;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm glass-panel rounded-xl p-6 shadow-2xl space-y-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          {!hideCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={`text-sm font-medium px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50 ${
              danger ? "bg-red-500 hover:bg-red-400" : "bg-teal-500 hover:bg-teal-400"
            }`}
          >
            {confirming ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
