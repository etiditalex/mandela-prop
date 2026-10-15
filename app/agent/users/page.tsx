"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { MoreHorizontal, UserCircle2, Users as UsersIcon } from "lucide-react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

function createIsolatedSignupClient() {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    throw new Error("Supabase env vars are missing.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      },
    },
  });
}

async function grantAdminRole(email: string, fullName: string) {
  const supabase = createSupabaseBrowserClient();
  const payload: { role: "admin"; full_name?: string } = { role: "admin" };
  if (fullName) payload.full_name = fullName;

  let lastError = "The account was created, but admin access could not be granted yet. Set the role to admin in the list.";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("email", email)
      .select("*")
      .maybeSingle();

    if (!error && data) return data as ProfileRow;
    if (error) lastError = error.message;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(lastError);
}

export default function AgentUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);

  const loadUsers = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setUsers(((data as unknown) as ProfileRow[] | null) ?? []);
    } catch {
      setError("Supabase env vars are missing.");
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const onRoleChange = async (userId: string, role: AppRole) => {
    setError(null);
    setMessage(null);
    setUpdatingUserId(userId);

    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, role } : user)),
      );
      setMessage("User role updated.");
    } catch {
      setError("Unable to update role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const onAddAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const fullName = adminName.trim();
    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword;
    if (fullName.length < 2) {
      setError("Enter the new admin's name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setAddingAdmin(true);
    try {
      const signup = createIsolatedSignupClient();
      const { data, error: signupError } = await signup.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      const alreadyRegistered =
        Boolean(signupError && /already registered|already exists/i.test(signupError.message)) ||
        Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

      if (signupError && !alreadyRegistered) {
        throw new Error(signupError.message);
      }

      const savedEmail = data.user?.email?.toLowerCase() || email;
      await grantAdminRole(savedEmail, fullName);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setMessage(
        alreadyRegistered
          ? `${savedEmail} already had an account. It is now an admin and keeps the existing password.`
          : data.session
            ? `${savedEmail} can sign in on the admin page with the password you set.`
            : `${savedEmail} is an admin. They should open the confirmation email, then sign in with the password you set.`,
      );
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add admin.");
    } finally {
      setAddingAdmin(false);
    }
  };
  const admins = users.filter((user) => user.role === "admin").length;
  const agents = users.filter((user) => user.role === "agent").length;
  const clients = users.filter((user) => user.role === "client").length;

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <AgentPageHeader title="Users" breadcrumb="staff accounts" />

      <form onSubmit={onAddAdmin} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black">Add admin</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Create another admin login</h2>
        <p className="mt-1 text-sm text-slate-500">
          They sign in on the admin page with this email and password. Your own session stays signed in.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Input id="admin_name" label="Full name" value={adminName} onChange={(event) => setAdminName(event.target.value)} required />
          <Input
            id="admin_email"
            type="email"
            label="Email"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
            autoComplete="off"
            required
          />
          <Input
            id="admin_password"
            type="password"
            label="Password"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div className="mt-4 space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" disabled={addingAdmin}>
            {addingAdmin ? "Adding admin..." : "Add admin"}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-karim-100 text-black">
            <UserCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{admins}</p>
            <p className="text-sm font-medium text-slate-500">Admins</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-karim-100 text-black">
            <UsersIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{agents}</p>
            <p className="text-sm font-medium text-slate-500">Agents</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-karim-100 text-black">
            <UsersIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{clients}</p>
            <p className="text-sm font-medium text-slate-500">Clients</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black">Directory</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Registered profiles</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a new admin above, or change an existing person to admin in the list.
          </p>
        </div>

        {(error || message) && (
          <div className="space-y-1 px-6 py-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Set role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="w-12 px-4 py-3 text-right font-medium" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 transition hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className="border-karim-100 bg-karim-50 capitalize text-karim-900">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Set role for {user.email}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      onChange={(event) =>
                        void onRoleChange(user.id, event.target.value as AppRole)
                      }
                      disabled={updatingUserId === user.id}
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs capitalize text-slate-700 outline-none transition-colors focus:border-karim-500 focus:ring-2 focus:ring-karim-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="client">client</option>
                      <option value="agent">agent</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    <button type="button" aria-label="Row menu" className="rounded-lg p-1 hover:bg-slate-100">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="border-t border-slate-100 px-6 py-14 text-center text-sm text-slate-500">
            No profiles found.
          </div>
        )}
      </div>
    </div>
  );
}
