import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <p className="text-sm font-semibold tracking-tight text-slate-400">Tenancy Builder</p>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-slate-400">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
        <Link
          href="/agreements"
          className="inline-block bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-400 transition-colors"
        >
          Back to agreements
        </Link>
      </div>
    </div>
  );
}
