import { ForgotPasswordForm } from "@/app/components/ForgotPasswordForm";
import { AbstractBackground } from "@/app/components/AbstractBackground";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center px-6 py-12">
      <AbstractBackground />
      <div className="relative w-full max-w-sm space-y-6 glass-panel rounded-2xl p-8 shadow-2xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Forgot password</h1>
          <p className="text-sm text-slate-400 mt-1">We&apos;ll email you a link to reset it.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
