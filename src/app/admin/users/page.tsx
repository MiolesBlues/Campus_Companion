"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getProfilesList } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const loadProfiles = async () => {
    const data = await getProfilesList();
    setProfiles(data as Profile[]);
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  if (!profile || profile.role !== "admin") {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Admin access only.</section>;
  }

  const updateRole = async (id: string, role: UserRole) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ role }).eq("id", id);
    await loadProfiles();
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
        <p className="mt-2 text-slate-600">Assign student, teacher, or admin roles.</p>
      </div>

      <div className="grid gap-4">
        {profiles.map((userProfile) => (
          <article key={userProfile.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{userProfile.full_name}</h2>
                <p className="text-sm text-slate-500">{userProfile.email}</p>
                <p className="mt-1 text-sm text-slate-600">Current role: {userProfile.role}</p>
              </div>
              <select
                value={userProfile.role}
                onChange={(event) => void updateRole(userProfile.id, event.target.value as UserRole)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              >
                <option value="student">student</option>
                <option value="teacher">teacher</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
