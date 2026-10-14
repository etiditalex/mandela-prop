"use client";

import { Suspense } from "react";

import { LoginForm, LoginFormFallback } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
