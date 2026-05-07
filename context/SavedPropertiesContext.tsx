"use client";

import {
  createContext,
  useEffect,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SavedPropertiesContextValue {
  savedIds: string[];
  toggleSave: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
  clearSaved: () => void;
  user: User | null;
}

const SavedPropertiesContext = createContext<
  SavedPropertiesContextValue | undefined
>(undefined);

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [supabase] = useState(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let mounted = true;
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        const { data: rows } = await supabase!
          .from("saved_properties")
          .select("property_id")
          .eq("user_id", nextUser.id);
        setSavedIds((rows ?? []).map((row) => row.property_id));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setSavedIds([]);
        return;
      }
      const { data: rows } = await supabase!
        .from("saved_properties")
        .select("property_id")
        .eq("user_id", currentUser.id);
      setSavedIds((rows ?? []).map((row) => row.property_id));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      savedIds,
      toggleSave: (propertyId: string) => {
        const run = async () => {
          if (!user || !supabase) return;
          const isCurrentlySaved = savedIds.includes(propertyId);
          if (isCurrentlySaved) {
            await supabase
              .from("saved_properties")
              .delete()
              .eq("user_id", user.id)
              .eq("property_id", propertyId);
            setSavedIds((current) => current.filter((id) => id !== propertyId));
            return;
          }
          await supabase.from("saved_properties").insert({
            user_id: user.id,
            property_id: propertyId,
          });
          setSavedIds((current) => [...current, propertyId]);
        };
        void run();
      },
      isSaved: (propertyId: string) => savedIds.includes(propertyId),
      clearSaved: () => {
        const run = async () => {
          if (!user || !supabase) return;
          await supabase.from("saved_properties").delete().eq("user_id", user.id);
          setSavedIds([]);
        };
        void run();
      },
    }),
    [savedIds, supabase, user],
  );

  return (
    <SavedPropertiesContext.Provider value={value}>
      {children}
    </SavedPropertiesContext.Provider>
  );
}

export function useSavedPropertiesContext() {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error("useSavedPropertiesContext must be used within its provider");
  }
  return context;
}
