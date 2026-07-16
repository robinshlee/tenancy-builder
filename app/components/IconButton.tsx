import Link from "next/link";

type Tone = "default" | "danger" | "primary";

const toneClass: Record<Tone, string> = {
  default: "text-slate-300 hover:text-white hover:bg-white/5",
  danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
  primary: "text-teal-300 hover:text-teal-200 hover:bg-teal-500/10",
};

const baseClass = "inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none";

export function IconLinkButton({
  href,
  label,
  tone = "default",
  children,
}: {
  href: string;
  label: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} title={label} aria-label={label} className={`${baseClass} ${toneClass[tone]}`}>
      {children}
    </Link>
  );
}

export function IconButton({
  onClick,
  label,
  tone = "default",
  disabled,
  children,
  type = "button",
}: {
  onClick?: () => void;
  label: string;
  tone?: Tone;
  disabled?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`${baseClass} ${toneClass[tone]}`}
    >
      {children}
    </button>
  );
}
