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
      className="w-full text-center text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50 px-3 py-2 rounded-md border border-neutral-200 hover:bg-neutral-50"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
