"use client";

import { FormEvent, useEffect, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default function AgentSettingsPage() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user ?? null;

        if (!user) {
          setError("Login required to access settings.");
          return;
        }

        // Supabase generated types are overly strict in this codebase.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profileData, error } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          setError(error.message);
          return;
        }

        setProfile(profileData);
      } catch {
        setError("Supabase env vars are missing.");
      }
    }

    void loadProfile();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!profile) {
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createSupabaseBrowserClient();
      const updates = {
        full_name: String(formData.get("full_name") ?? ""),
        phone: String(formData.get("phone") ?? "") || null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("profiles").update(updates).eq("id", profile.id);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProfile((current) => (current ? { ...current, ...updates } : current));
      setMessage("Settings updated successfully.");
    } catch {
      setError("Unable to update settings.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <AgentPageHeader
        title="Settings"
        breadcrumb="Dashboard / Settings"
        actions={
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">Profile</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Update your profile and manage your staff session.
          </p>
        </div>

        {profile ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Input
              id="full_name"
              name="full_name"
              label="Full Name"
              defaultValue={profile.full_name}
              required
            />
            <Input
              id="email"
              name="email"
              label="Email"
              defaultValue={profile.email}
              disabled
            />
            <Input id="phone" name="phone" label="Phone" defaultValue={profile.phone ?? ""} />
            <Input id="role" name="role" label="Role" defaultValue={profile.role} disabled />

            {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
            {message && <p className="md:col-span-2 text-sm text-emerald-600">{message}</p>}

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
            {error ?? "Loading profile…"}
          </div>
        )}
      </div>
    </div>
  );
}
