"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/app/components/SignOutButton";

const SECTION_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/agreements/new", title: "New Agreement" },
  { prefix: "/agreements", title: "Agreements" },
  { prefix: "/properties", title: "Properties" },
  { prefix: "/property-groups", title: "Property Groups" },
  { prefix: "/landlords", title: "Landlords" },
  { prefix: "/tenants", title: "Tenants" },
  { prefix: "/admin/users", title: "User Management" },
  { prefix: "/admin/template", title: "Agreement Template" },
];

function sectionTitle(pathname: string): string {
  if (pathname === "/agreements") return "Dashboard";
  const match = SECTION_TITLES.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`));
  return match?.title ?? "Dashboard";
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function initials(email: string | null): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

export function TopBar({ email, role }: { email: string | null; role: "agent" | "admin" }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header className="hidden md:flex items-center justify-between glass-panel border-b border-white/10 px-6 py-4">
      <h1 className="text-lg font-semibold text-white">{sectionTitle(pathname)}</h1>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <BellIcon />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-md shadow-xl p-3 text-sm text-slate-300 z-50">
              No new notifications.
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-teal-500/20 ring-1 ring-teal-400/40 flex items-center justify-center text-teal-300 text-xs font-semibold">
              {initials(email)}
            </span>
            <span className="hidden lg:flex flex-col items-start leading-tight">
              <span className="text-sm text-white">{email ?? "Signed in"}</span>
              <span className="text-xs text-slate-400 capitalize">{role}</span>
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-md shadow-xl p-2 z-50">
              <p className="px-2 py-1.5 text-xs text-slate-400 truncate">{email}</p>
              <div className="px-2 pb-1">
                <SignOutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
