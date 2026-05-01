"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getLocations } from "@/lib/data";
import type { LocationRecord } from "@/types/database";

function locationRecommendationScore(location: LocationRecord, campus: string | null | undefined) {
  let score = 0;
  if (campus && location.campus === campus) score += 3;
  return score;
}

export default function LocationsPage() {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    const loadLocations = async () => {
      const data = await getLocations();
      setLocations(data);
    };

    void loadLocations();
  }, []);

  const types = useMemo(
    () => ["All", ...Array.from(new Set(locations.map((location) => location.type))).sort()],
    [locations],
  );

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...locations]
      .filter((location) => {
        if (selectedType !== "All" && location.type !== selectedType) return false;
        if (!query) return true;
        return [location.name, location.type, location.description, location.campus ?? "", location.opening_hours ?? "", location.accessibility_notes ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const scoreDiff = locationRecommendationScore(b, profile?.campus) - locationRecommendationScore(a, profile?.campus);
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.localeCompare(b.name);
      });
  }, [locations, profile?.campus, search, selectedType]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Find Your Way
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Locations</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Find important campus spaces, support centres, and study areas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <label htmlFor="location-search" className="mb-2 block text-sm font-medium text-slate-700">
              Search locations
            </label>
            <input
              id="location-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, type, campus, description, hours, or accessibility"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="location-type" className="mb-2 block text-sm font-medium text-slate-700">
              Filter by type
            </label>
            <select
              id="location-type"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map((location) => {
          const matchesCampus = Boolean(profile?.campus && location.campus === profile.campus);
          return (
            <article key={location.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {location.type}
                </span>
                {location.campus && (
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {location.campus}
                  </span>
                )}
                {matchesCampus && (
                  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    Matches your campus
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">{location.name}</h2>

              <p className="mt-3 text-sm text-slate-600 sm:text-base">{location.description}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">Opening hours:</span>{" "}
                  {location.opening_hours ?? "Not provided"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Accessibility:</span>{" "}
                  {location.accessibility_notes ?? "Not provided"}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 shadow-sm sm:p-8">
          No locations found for your current search.
        </div>
      )}
    </section>
  );
}
