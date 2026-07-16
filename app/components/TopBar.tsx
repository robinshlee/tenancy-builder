"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/app/components/SignOutButton";

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function TopBar({
  companyName,
  displayName,
  email,
  role,
  pendingApprovalCount = 0,
}: {
  companyName: string | null;
  displayName: string | null;
  email: string | null;
  role: "agent" | "admin";
  pendingApprovalCount?: number;
}) {
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
    <header className="hidden md:flex items-center justify-between glass-panel border-b border-white/10 px-6 py-4 relative z-40">
      <h1 className="text-lg font-semibold text-white">{companyName ?? "Tenancy Builder"}</h1>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <BellIcon />
            {pendingApprovalCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-navy-850 border border-white/10 rounded-md shadow-2xl p-3 text-sm text-slate-300 z-50">
              {pendingApprovalCount > 0 ? (
                <Link
                  href="/admin/users?status=pending"
                  onClick={() => setNotifOpen(false)}
                  className="block hover:text-white"
                >
                  {pendingApprovalCount} user{pendingApprovalCount === 1 ? "" : "s"} pending approval
                </Link>
              ) : (
                "No new notifications."
              )}
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
              {initials(displayName)}
            </span>
            <span className="hidden lg:flex flex-col items-start leading-tight">
              <span className="text-sm text-white">{displayName ?? "Signed in"}</span>
              <span className="text-xs text-slate-400 capitalize">{role}</span>
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-navy-850 border border-white/10 rounded-md shadow-2xl p-2 z-50">
              <p className="px-2 py-1.5 text-xs text-slate-400 truncate border-b border-white/10 mb-1">{email}</p>
              <Link
                href="/account/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Update profile
              </Link>
              <Link
                href="/account/change-password"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Change password
              </Link>
              <div className="px-2 pt-1 mt-1 border-t border-white/10">
                <SignOutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
