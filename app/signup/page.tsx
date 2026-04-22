"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("full_name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (signupError) {
        setError(signupError.message);
        return;
      }
      setMessage("Account created. Check your email to verify your account.");
    } catch {
      setError("Supabase env vars are missing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Create Account</h1>
      <form className="space-y-4 rounded-sm border border-zinc-200 bg-white p-6" onSubmit={onSubmit}>
        <Input id="full_name" name="full_name" label="Full Name" required />
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="password" name="password" type="password" label="Password" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
        <p className="text-sm text-zinc-600">
          Already registered?{" "}
          <Link className="text-brand hover:underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}
