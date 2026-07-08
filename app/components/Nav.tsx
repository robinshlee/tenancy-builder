import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/agreements" className="font-semibold tracking-tight text-lg">
          Tenancy Builder
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/agreements" className="text-neutral-600 hover:text-neutral-900">
            Agreements
          </Link>
          <Link
            href="/agreements/new"
            className="bg-neutral-900 text-white px-3 py-1.5 rounded-md hover:bg-neutral-700"
          >
            New Agreement
          </Link>
        </nav>
      </div>
    </header>
  );
}
