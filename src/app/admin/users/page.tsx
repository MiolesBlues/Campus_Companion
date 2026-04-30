"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getProfilesList } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const loadProfiles = async () => {
    const data = await getProfilesList();
    setProfiles(data as Profile[]);
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;

    return profiles.filter((userProfile) =>
      [userProfile.full_name, userProfile.email ?? "", userProfile.role, userProfile.course ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [profiles, search]);

  if (!profile || profile.role !== "admin") {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Admin access only.</section>;
  }

  const updateRole = async (id: string, role: UserRole) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ role }).eq("id", id);
    await loadProfiles();
  };

  const toggleBan = async (id: string, banned: boolean) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ banned: !banned }).eq("id", id);
    await loadProfiles();
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
        <p className="mt-2 text-slate-600">Assign roles, ban users, and search the user list.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users by name, email, role, or course"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
        />
      </div>

      <div className="grid gap-4">
        {filteredProfiles.map((userProfile) => (
          <article key={userProfile.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{userProfile.full_name}</h2>
                <p className="text-sm text-slate-500">{userProfile.email}</p>
                <p className="mt-1 text-sm text-slate-600">Current role: {userProfile.role}</p>
                <p className="mt-1 text-sm text-slate-600">Status: {userProfile.banned ? "Banned" : "Active"}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={userProfile.role}
                  onChange={(event) => void updateRole(userProfile.id, event.target.value as UserRole)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => void toggleBan(userProfile.id, userProfile.banned ?? false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium text-white ${userProfile.banned ? "bg-green-600" : "bg-red-600"}`}
                >
                  {userProfile.banned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
