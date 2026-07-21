"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The admin login form — the one interactive island on the login page.
 *
 * Validates shape locally (a real email, a non-empty password) so an obvious
 * mistake is caught without a round trip, then calls BetterAuth's
 * `signIn.email`. On success it routes to wherever the middleware bounced the
 * visitor from (`?from=`), or the dashboard. Server errors are shown as one
 * calm line — never which of the two fields was wrong, so the form can't be
 * used to probe which emails exist.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{
    email?: string;
    password?: string;
  }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errs: { email?: string; password?: string } = {};
    if (!EMAIL.test(email.trim())) errs.email = "Enter a valid email address.";
    if (password.length < 1) errs.password = "Enter your password.";
    setFieldError(errs);
    if (errs.email || errs.password) return;

    setLoading(true);
    const { error: authError } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe: remember,
    });
    setLoading(false);

    if (authError) {
      setError("Those credentials don’t match. Please try again.");
      return;
    }
    router.push(from && from.startsWith("/admin") ? from : "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div
          role="alert"
          className="border-error/30 bg-error/10 text-error flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@stayze.in"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldError.email)
            setFieldError((f) => ({ ...f, email: undefined }));
        }}
        error={fieldError.email}
        disabled={loading}
      />

      <Input
        label="Password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldError.password)
            setFieldError((f) => ({ ...f, password: undefined }));
        }}
        error={fieldError.password}
        disabled={loading}
        trailing={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="text-muted-ink hover:text-bark focus-visible:ring-ring grid size-8 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {show ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <label className="text-muted-ink flex cursor-pointer items-center gap-2 text-sm select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-clay size-4 rounded"
          />
          Remember me
        </label>
        <span
          className="text-muted-ink/60 cursor-not-allowed text-sm"
          title="Coming soon"
        >
          Forgot password?
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-1 w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}
