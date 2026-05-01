"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getProfilesList } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

const muteOptions = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

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
      [
        userProfile.full_name,
        userProfile.email ?? "",
        userProfile.role,
        userProfile.course ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [profiles, search]);

  if (!profile || profile.role !== "admin") {
    return (
      <section className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-6 text-[#9F2F2D] ">
        Admin access only.
      </section>
    );
  }

  const updateRole = async (id: string, role: UserRole) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ role }).eq("id", id);
    await loadProfiles();
  };

  const muteUser = async (id: string, days: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const mutedUntil = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();
    await supabase
      .from("profiles")
      .update({ muted_until: mutedUntil })
      .eq("id", id);
    await loadProfiles();
  };

  const clearMute = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ muted_until: null }).eq("id", id);
    await loadProfiles();
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111111]">Manage Users</h1>
        <p className="mt-2 text-[#64615C]">
          Assign roles, mute users for a period, and search the user list.
        </p>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 ">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users by name, email, role, or course"
          className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
        />
      </div>

      <div className="grid gap-4">
        {filteredProfiles.map((userProfile) => {
          const isMuted = Boolean(
            userProfile.muted_until &&
              new Date(userProfile.muted_until) > new Date(),
          );

          return (
            <article
              key={userProfile.id}
              className="rounded-xl border border-[#EAEAEA] bg-white p-5 "
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">
                    {userProfile.full_name}
                  </h2>
                  <p className="text-sm text-[#787774]">{userProfile.email}</p>
                  <p className="mt-1 text-sm text-[#64615C]">
                    Current role: {userProfile.role}
                  </p>
                  <p className="mt-1 text-sm text-[#64615C]">
                    Status:{" "}
                    {isMuted
                      ? `Muted until ${userProfile.muted_until}`
                      : "Active"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <select
                    value={userProfile.role}
                    onChange={(event) =>
                      void updateRole(
                        userProfile.id,
                        event.target.value as UserRole,
                      )
                    }
                    className="rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="admin">admin</option>
                  </select>
                  {!isMuted ? (
                    <div className="flex flex-wrap gap-2">
                      {muteOptions.map((option) => (
                        <button
                          key={option.days}
                          type="button"
                          onClick={() =>
                            void muteUser(userProfile.id, option.days)
                          }
                          className="rounded-xl bg-[#956400] px-3 py-2 text-sm font-medium text-white"
                        >
                          Mute {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void clearMute(userProfile.id)}
                      className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white"
                    >
                      Unmute
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
