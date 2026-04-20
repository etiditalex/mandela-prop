"use client";

import { ReactNode } from "react";

import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <SavedPropertiesProvider>{children}</SavedPropertiesProvider>;
}
