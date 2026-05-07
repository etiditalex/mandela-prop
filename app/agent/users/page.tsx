"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, UserCircle2, Users as UsersIcon } from "lucide-react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export default function AgentUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const admins = users.filter((user) => user.role === "admin").length;
  const agents = users.filter((user) => user.role === "agent").length;
  const clients = users.filter((user) => user.role === "client").length;

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <AgentPageHeader
        title="Users"
        breadcrumb="Dashboard / Users"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{admins}</p>
            <p className="text-sm font-medium text-slate-500">Admins</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UsersIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{agents}</p>
            <p className="text-sm font-medium text-slate-500">Agents</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">Directory</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Registered profiles</h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin-only roster from Supabase. Agents manage listings elsewhere.
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
                    <Badge className="border-blue-100 bg-blue-50 capitalize text-blue-800">
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
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs capitalize text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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
