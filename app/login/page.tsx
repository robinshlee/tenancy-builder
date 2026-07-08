import { Suspense } from "react";
import { AuthForm } from "@/app/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Tenancy Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Log in to your account</p>
        </div>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
