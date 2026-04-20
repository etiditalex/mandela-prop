"use client";

import { Button } from "@/components/ui/Button";
import { useSavedProperties } from "@/hooks/useSavedProperties";

export function SavePropertyButton({ propertyId }: { propertyId: string }) {
  const { isSaved, toggleSave, user } = useSavedProperties();
  const saved = isSaved(propertyId);

  return (
    <Button
      className="w-full"
      disabled={!user}
      onClick={() => toggleSave(propertyId)}
      title={!user ? "Login to save properties" : undefined}
    >
      {saved ? "Saved" : user ? "Save Property" : "Login to Save"}
    </Button>
  );
}
