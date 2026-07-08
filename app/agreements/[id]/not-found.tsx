import Link from "next/link";
import { Nav } from "@/app/components/Nav";

export default function AgreementNotFound() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Agreement not found</h1>
        <p className="text-neutral-500 mb-6">This agreement doesn&apos;t exist or may have been deleted.</p>
        <Link href="/agreements" className="text-sm text-neutral-900 underline">
          Back to agreements
        </Link>
      </main>
    </div>
  );
}
