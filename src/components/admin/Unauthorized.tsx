import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/admin/LogoutButton";

/**
 * Shown to a signed-in user who lacks SUPER_ADMIN. They're authenticated (so
 * we don't bounce them to login), just not permitted — a calm dead-end with a
 * way to sign out or return to the public site. No detail about what they're
 * missing.
 */
export function Unauthorized() {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <span className="bg-error/10 text-error mb-6 inline-flex size-16 items-center justify-center rounded-full">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <h1 className="heading-1 text-bark">Not authorised</h1>
      <p className="text-muted-ink mt-3 max-w-md text-base leading-relaxed">
        Your account doesn’t have access to the Stayze admin console. If you
        think this is a mistake, contact a site administrator.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">Back to Stayze</Link>
        </Button>
        <div className="w-px" />
        <LogoutButton variant="menu" className="w-auto justify-center" />
      </div>
    </div>
  );
}
