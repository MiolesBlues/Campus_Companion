"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSocietiesList, getUserSocietyMemberships } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Society } from "@/types/database";

function societyRecommendationScore(
  society: Society,
  interests: string[] | null | undefined,
  preferredSocietyCategories: string[] | null | undefined,
) {
  let score = 0;
  if (preferredSocietyCategories?.includes(society.category)) score += 3;
  if (interests?.includes(society.category)) score += 2;
  return score;
}

export default function SocietiesPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [memberships, setMemberships] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");
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

  const categories = useMemo(
    () => ["All", ...new Set(societies.map((society) => society.category))],
    [societies],
  );
  const meetingDays = useMemo(
    () => [
      "All",
      ...new Set(
        societies
          .map((society) => society.meeting_day)
          .filter(Boolean) as string[],
      ),
    ],
    [societies],
  );

  const filteredSocieties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...societies]
      .filter((society) => {
        const matchesSearch =
          !query ||
          [
            society.name,
            society.category,
            society.description,
            society.contact_email ?? "",
            society.meeting_day ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesCategory =
          selectedCategory === "All" || society.category === selectedCategory;
        const matchesDay =
          selectedDay === "All" || society.meeting_day === selectedDay;
        return matchesSearch && matchesCategory && matchesDay;
      })
      .sort((a, b) => {
        const scoreDiff =
          societyRecommendationScore(
            b,
            profile?.interests,
            profile?.preferred_society_categories,
          ) -
          societyRecommendationScore(
            a,
            profile?.interests,
            profile?.preferred_society_categories,
          );
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.localeCompare(b.name);
      });
  }, [
    profile?.interests,
    profile?.preferred_society_categories,
    search,
    selectedCategory,
    selectedDay,
    societies,
  ]);

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
      await supabase
        .from("society_memberships")
        .delete()
        .eq("user_id", user.id)
        .eq("society_id", society.id);
      const nextSocieties = (profile.societies ?? []).filter(
        (item) => item.society_id !== society.id,
      );
      await supabase
        .from("profiles")
        .update({ societies: nextSocieties })
        .eq("id", user.id);
      setMemberships((current) => current.filter((id) => id !== society.id));
      setMessage(`Left ${society.name}.`);
    } else {
      await supabase
        .from("society_memberships")
        .insert({ user_id: user.id, society_id: society.id });
      const nextSocieties = [
        ...(profile.societies ?? []),
        { society_id: society.id, name: society.name },
      ];
      await supabase
        .from("profiles")
        .update({ societies: nextSocieties })
        .eq("id", user.id);
      setMemberships((current) => [...current, society.id]);
      setMessage(`Joined ${society.name}.`);
    }

    await refreshProfile();
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Student Communities
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Societies</h1>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Explore clubs and societies across campus and find your people.
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-[#EAEAEA] bg-white p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <label
            htmlFor="society-search"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Search societies
          </label>
          <input
            id="society-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category, description, contact, or meeting day"
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="society-category"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Category
          </label>
          <select
            id="society-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="society-day"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Meeting day
          </label>
          <select
            id="society-day"
            value={selectedDay}
            onChange={(event) => setSelectedDay(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          >
            {meetingDays.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {filteredSocieties.map((society) => {
          const joined = memberships.includes(society.id);
          const score = societyRecommendationScore(
            society,
            profile?.interests,
            profile?.preferred_society_categories,
          );
          return (
            <article
              key={society.id}
              className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-[#F7F6F3] px-3 py-1 text-sm font-medium text-[#4A4844]">
                  {society.category}
                </span>
                {score > 0 && (
                  <span className="inline-block rounded-full bg-[#EDF3EC] px-3 py-1 text-sm font-medium text-[#346538]">
                    Matches your interests
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[#111111]">
                {society.name}
              </h2>
              <p className="mt-3 text-sm text-[#64615C] sm:text-base">
                {society.description}
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#787774]">
                <p>
                  <span className="font-medium text-[#4A4844]">
                    Meeting day:
                  </span>{" "}
                  {society.meeting_day ?? "Not listed"}
                </p>
                <p>
                  <span className="font-medium text-[#4A4844]">Contact:</span>{" "}
                  {society.contact_email ?? "Not listed"}
                </p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void toggleJoin(society)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${joined ? "bg-[#4A4844]" : "bg-[#111111]"}`}
                >
                  {joined ? "Joined" : "Join society"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredSocieties.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-white p-6 text-center text-[#64615C] sm:p-8">
          No societies found for your current filters.
        </div>
      )}
    </section>
  );
}
