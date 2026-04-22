"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/agent/properties";
  }
  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterLogin = useMemo(
    () => safeRedirectPath(searchParams.get("next")),
    [searchParams],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!user) {
        setError("Login succeeded but no user session was returned.");
        return;
      }

      router.replace(afterLogin);
      router.refresh();
    } catch {
      setError("Unable to sign in. Check your connection and Supabase settings.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${afterLogin}`,
        },
      });
    } catch {
      setError("Supabase env vars are missing.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Login</h1>
      <form className="space-y-4 rounded-sm border border-zinc-200 bg-white p-6" onSubmit={onSubmit}>
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="password" name="password" type="password" label="Password" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Button className="w-full" type="button" variant="outline" onClick={onGoogleLogin}>
          Continue with Google
        </Button>
        <p className="text-sm text-zinc-600">
          No account?{" "}
          <Link className="text-brand hover:underline" href="/signup">
            Create one
          </Link>
        </p>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto w-full max-w-md px-4 py-16">
          <div className="h-9 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="mt-6 space-y-4 rounded-sm border border-zinc-200 bg-white p-6">
            <div className="h-16 animate-pulse rounded bg-zinc-100" />
            <div className="h-16 animate-pulse rounded bg-zinc-100" />
            <div className="h-11 animate-pulse rounded bg-zinc-100" />
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
