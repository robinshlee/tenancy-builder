"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full text-center text-sm text-slate-300 hover:text-white disabled:opacity-50 px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
