"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Logout — ends the BetterAuth session (which clears the HTTP-only cookie
 * server-side) and returns to the login page. Shared by the sidebar and the
 * profile menu; `variant` styles it for the dark sidebar or a light menu row.
 */
export function LogoutButton({
  variant = "sidebar",
  className,
}: {
  variant?: "sidebar" | "menu";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-3 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
        variant === "sidebar"
          ? "text-paper/70 hover:bg-paper/10 hover:text-paper focus-visible:ring-paper/40 px-3 py-2.5"
          : "text-bark hover:bg-paper-2 focus-visible:ring-ring px-3 py-2",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <LogOut className="size-4 shrink-0" aria-hidden />
      )}
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
