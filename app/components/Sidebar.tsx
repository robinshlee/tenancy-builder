"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/app/components/SignOutButton";

const NAV_ITEMS = [
  { href: "/agreements", label: "Agreements" },
  { href: "/landlords", label: "Landlords" },
  { href: "/tenants", label: "Tenants" },
  { href: "/properties", label: "Properties" },
];

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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:border-neutral-200 md:bg-white md:px-4 md:py-6 md:z-30">
        <Link href="/agreements" className="font-semibold tracking-tight text-lg px-3 mb-6">
          Tenancy Builder
        </Link>
        <NavLinks />
        <div className="mt-auto px-3 pt-6 border-t border-neutral-200 space-y-3">
          <Link
            href="/agreements/new"
            className="block text-center bg-neutral-900 text-white px-3 py-2 rounded-md text-sm hover:bg-neutral-700"
          >
            + New Agreement
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <Link href="/agreements" className="font-semibold tracking-tight text-lg">
          Tenancy Builder
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-neutral-700"
        >
          <HamburgerIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-64 max-w-[80%] bg-white h-full px-4 py-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold tracking-tight text-lg">Tenancy Builder</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 text-neutral-700"
              >
                <CloseIcon />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto pt-6 border-t border-neutral-200 space-y-3">
              <Link
                href="/agreements/new"
                onClick={() => setOpen(false)}
                className="block text-center bg-neutral-900 text-white px-3 py-2 rounded-md text-sm hover:bg-neutral-700"
              >
                + New Agreement
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
