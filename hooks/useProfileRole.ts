"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

export type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export function useProfileRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authUnavailable, setAuthUnavailable] = useState(false);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setAuthUnavailable(true);
      setReady(true);
      return;
    }

    async function load(nextUser: User | null) {
      setUser(nextUser);
      if (!nextUser) {
        setRole(null);
        setFullName(null);
        setReady(true);
        return;
      }
      const { data } = await supabase!
        .from("profiles")
        .select("role, full_name")
        .eq("id", nextUser.id)
        .maybeSingle();
      setRole(data?.role ?? null);
      setFullName(data?.full_name ?? null);
      setReady(true);
    }

    supabase.auth.getUser().then(({ data }) => {
      void load(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isStaff = role === "agent" || role === "admin";
  const isAdmin = role === "admin";

  const displayName =
    (fullName && fullName.trim()) ||
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ||
    user?.email ||
    "Staff";

  return { user, role, fullName, displayName, ready, isStaff, isAdmin, authUnavailable };
}
