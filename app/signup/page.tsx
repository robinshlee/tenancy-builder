import { Suspense } from "react";
import { AuthForm } from "@/app/components/AuthForm";
import { AbstractBackground } from "@/app/components/AbstractBackground";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      <AbstractBackground />
      <div className="relative min-h-screen flex items-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center justify-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-md bg-teal-500/20 ring-1 ring-teal-400/40 flex items-center justify-center text-teal-300 text-sm font-bold">
                T
              </span>
              <span className="font-semibold tracking-tight text-white">Tenancy Builder</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Ditch the copy-paste. Close the deal.
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Eliminate the paperwork bottleneck. Secure your rentals with error-free, automated tenancy agreements
              built in clicks.
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto lg:mx-0 space-y-6 glass-panel rounded-2xl p-8 shadow-2xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Create account</h2>
              <p className="text-sm text-slate-400 mt-1">Set up your Tenancy Builder account</p>
            </div>
            <Suspense>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
