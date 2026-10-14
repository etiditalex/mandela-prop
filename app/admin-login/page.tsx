"use client";

import { Suspense } from "react";

import { LoginForm, LoginFormFallback } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback title="Admin login" />}>
      <LoginForm title="Admin login" defaultNext="/agent" showSignup={false} />
    </Suspense>
  );
}
