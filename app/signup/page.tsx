import { Suspense } from "react";
import { AuthForm } from "@/app/components/AuthForm";
import { ArchitecturalIllustration } from "@/app/components/ArchitecturalIllustration";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 hidden lg:flex items-center justify-end pr-16 opacity-90">
        <ArchitecturalIllustration />
      </div>
      <div className="relative w-full max-w-sm space-y-6 glass-panel rounded-2xl p-8 shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create account</h1>
          <p className="text-sm text-slate-400 mt-1">Set up your Tenancy Builder account</p>
        </div>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
      <p className="absolute bottom-6 left-8 text-xs text-slate-500 tracking-wide hidden lg:block">
        Secure Access · Tenancy Builder
      </p>
    </div>
  );
}
