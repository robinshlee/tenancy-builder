"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/app/components/SignOutButton";
import { AddIcon } from "@/app/components/icons";

const NAV_ITEMS = [
  { href: "/agreements", label: "Agreements", icon: "document" },
  { href: "/properties", label: "Properties", icon: "building" },
  { href: "/property-groups", label: "Property Groups", icon: "layers" },
  { href: "/landlords", label: "Landlords", icon: "user" },
  { href: "/tenants", label: "Tenants", icon: "users" },
] as const;

const ADMIN_NAV_ITEMS = [
  { href: "/admin/users", label: "User Management", icon: "shield" },
  { href: "/admin/template", label: "Agreement Template", icon: "file" },
] as const;

const ACCOUNT_SUB_ITEMS = [
  { href: "/account/profile", label: "Update Profile" },
  { href: "/account/change-password", label: "Change Password" },
] as const;

type IconName = (typeof NAV_ITEMS)[number]["icon"] | (typeof ADMIN_NAV_ITEMS)[number]["icon"] | "account" | "chevron";

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "document":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
          <line x1="9.5" y1="13" x2="14.5" y2="13" />
          <line x1="9.5" y1="17" x2="14.5" y2="17" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="10" height="18" />
          <rect x="14" y="9" width="6" height="12" />
          <line x1="7" y1="7" x2="7" y2="7.01" />
          <line x1="11" y1="7" x2="11" y2="7.01" />
          <line x1="7" y1="11" x2="7" y2="11.01" />
          <line x1="11" y1="11" x2="11" y2="11.01" />
          <line x1="7" y1="15" x2="7" y2="15.01" />
          <line x1="11" y1="15" x2="11" y2="15.01" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="M12 3 2 8l10 5 10-5-10-5Z" />
          <path d="M2 13l10 5 10-5" />
          <path d="M2 18l10 5 10-5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
          <path d="M16 5.5a3 3 0 0 1 0 6" />
          <path d="M22 20c0-2.8-2.2-5.1-5-5.7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6l8-3Z" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" />
        </svg>
      );
    case "chevron":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
  }
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function NavLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;
  const accountActive = ACCOUNT_SUB_ITEMS.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const [accountOpen, setAccountOpen] = useState(accountActive);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              active ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/30" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => setAccountOpen((v) => !v)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          accountActive ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/30" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <NavIcon name="account" />
        <span className="flex-1 text-left">Account</span>
        <span className={`transition-transform ${accountOpen ? "rotate-90" : ""}`}>
          <NavIcon name="chevron" />
        </span>
      </button>
      {accountOpen && (
        <div className="flex flex-col gap-1 pl-9">
          {ACCOUNT_SUB_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 glass-panel md:border-r md:border-white/10 md:px-4 md:py-6 md:z-30">
        <Link href="/agreements" className="flex items-center gap-2 px-3 mb-6">
          <span className="w-7 h-7 rounded-md bg-teal-500/20 ring-1 ring-teal-400/40 flex items-center justify-center text-teal-300 text-sm font-bold">
            T
          </span>
          <span className="font-semibold tracking-tight text-lg text-white">Tenancy Builder</span>
        </Link>
        <NavLinks isAdmin={isAdmin} />
        <div className="mt-auto px-3 pt-6 border-t border-white/10 space-y-3">
          <Link
            href="/agreements/new"
            className="flex items-center justify-center gap-1.5 text-center bg-teal-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
          >
            <AddIcon className="w-4 h-4" /> New Agreement
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between glass-panel border-b border-white/10 px-4 py-3">
        <Link href="/agreements" className="flex items-center gap-2 font-semibold tracking-tight text-lg text-white">
          <span className="w-6 h-6 rounded-md bg-teal-500/20 ring-1 ring-teal-400/40 flex items-center justify-center text-teal-300 text-xs font-bold">
            T
          </span>
          Tenancy Builder
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -mr-2 text-slate-300">
          <HamburgerIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] bg-navy-900 h-full px-4 py-6 flex flex-col shadow-2xl border-r border-white/10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold tracking-tight text-lg text-white">Tenancy Builder</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-slate-300">
                <CloseIcon />
              </button>
            </div>
            <NavLinks isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
            <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
              <Link
                href="/agreements/new"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-center bg-teal-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
              >
                <AddIcon className="w-4 h-4" /> New Agreement
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
