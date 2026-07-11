"use client";

import Link from "next/link";

export default function AgreementError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-slate-400 mb-6">Please try again.</p>
      <div className="flex justify-center gap-4">
        <button onClick={reset} className="text-sm bg-teal-500 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-400 transition-colors">
          Try again
        </button>
        <Link href="/agreements" className="text-sm text-teal-300 hover:text-teal-200 underline self-center">
          Back to agreements
        </Link>
      </div>
    </div>
  );
}
