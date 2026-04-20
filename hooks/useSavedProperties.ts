"use client";

import { useSavedPropertiesContext } from "@/context/SavedPropertiesContext";

export function useSavedProperties() {
  return useSavedPropertiesContext();
}
