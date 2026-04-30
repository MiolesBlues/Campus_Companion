"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSocietiesList, getUserSocietyMemberships } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Society } from "@/types/database";

export default function SocietiesPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [memberships, setMemberships] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSocieties = async () => {
      const data = await getSocietiesList();
      setSocieties(data);
    };

    void loadSocieties();
  }, []);

  useEffect(() => {
    const loadMemberships = async () => {
      if (!user) {
        setMemberships([]);
        return;
      }
      const data = await getUserSocietyMemberships(user.id);
      setMemberships(data.map((item) => item.society_id));
    };

    void loadMemberships();
  }, [user]);

  const filteredSocieties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return societies;

    return societies.filter((society) =>
      [society.name, society.category, society.description, society.contact_email ?? "", society.meeting_day ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, societies]);

  const toggleJoin = async (society: Society) => {
    if (!user || !profile) {
      setMessage("Please log in to join societies.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    const joined = memberships.includes(society.id);

    if (joined) {
      await supabase.from("society_memberships").delete().eq("user_id", user.id).eq("society_id", society.id);
      const nextSocieties = (profile.societies ?? []).filter((item) => item.society_id !== society.id);
      await supabase.from("profiles").update({ societies: nextSocieties }).eq("id", user.id);
      setMemberships((current) => current.filter((id) => id !== society.id));
      setMessage(`Left ${society.name}.`);
    } else {
      await supabase.from("society_memberships").insert({ user_id: user.id, society_id: society.id });
      const nextSocieties = [...(profile.societies ?? []), { society_id: society.id, name: society.name }];
      await supabase.from("profiles").update({ societies: nextSocieties }).eq("id", user.id);
      setMemberships((current) => [...current, society.id]);
      setMessage(`Joined ${society.name}.`);
    }

    await refreshProfile();
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Student Communities</span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Societies</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Explore clubs and societies across campus and find your people.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label htmlFor="society-search" className="mb-2 block text-sm font-medium text-slate-700">Search societies</label>
        <input id="society-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, category, description, contact, or meeting day" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" />
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">{message}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSocieties.map((society) => {
          const joined = memberships.includes(society.id);
          return (
            <article key={society.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{society.category}</span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{society.name}</h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">{society.description}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p><span className="font-medium text-slate-700">Meeting day:</span> {society.meeting_day ?? "Not listed"}</p>
                <p><span className="font-medium text-slate-700">Contact:</span> {society.contact_email ?? "Not listed"}</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void toggleJoin(society)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${joined ? "bg-slate-600" : "bg-slate-900"}`}
                >
                  {joined ? "Joined" : "Join society"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredSocieties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 shadow-sm sm:p-8">
          No societies found for your current search.
        </div>
      )}
    </section>
  );
}
