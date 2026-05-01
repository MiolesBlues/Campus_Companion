"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getLocations } from "@/lib/data";
import type { LocationRecord } from "@/types/database";

function locationRecommendationScore(
  location: LocationRecord,
  campus: string | null | undefined,
) {
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
    () => [
      "All",
      ...Array.from(new Set(locations.map((location) => location.type))).sort(),
    ],
    [locations],
  );

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...locations]
      .filter((location) => {
        if (selectedType !== "All" && location.type !== selectedType)
          return false;
        if (!query) return true;
        return [
          location.name,
          location.type,
          location.description,
          location.campus ?? "",
          location.opening_hours ?? "",
          location.accessibility_notes ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const scoreDiff =
          locationRecommendationScore(b, profile?.campus) -
          locationRecommendationScore(a, profile?.campus);
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.localeCompare(b.name);
      });
  }, [locations, profile?.campus, search, selectedType]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Find Your Way
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">
            Campus Locations
          </h1>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Find important campus spaces, support centres, and study areas.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="location-search"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Search locations
            </label>
            <input
              id="location-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, type, campus, description, hours, or accessibility"
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="location-type"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Filter by type
            </label>
            <select
              id="location-type"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {filteredLocations.map((location) => {
          const matchesCampus = Boolean(
            profile?.campus && location.campus === profile.campus,
          );
          return (
            <article
              key={location.id}
              className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-[#F7F6F3] px-3 py-1 text-sm font-medium text-[#4A4844]">
                  {location.type}
                </span>
                {location.campus && (
                  <span className="inline-block rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
                    {location.campus}
                  </span>
                )}
                {matchesCampus && (
                  <span className="inline-block rounded-full bg-[#EDF3EC] px-3 py-1 text-sm font-medium text-[#346538]">
                    Matches your campus
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-[#111111]">
                {location.name}
              </h2>

              <p className="mt-3 text-sm text-[#64615C] sm:text-base">
                {location.description}
              </p>

              <div className="mt-4 space-y-2 text-sm text-[#787774]">
                <p>
                  <span className="font-medium text-[#4A4844]">
                    Opening hours:
                  </span>{" "}
                  {location.opening_hours ?? "Not provided"}
                </p>
                <p>
                  <span className="font-medium text-[#4A4844]">
                    Accessibility:
                  </span>{" "}
                  {location.accessibility_notes ?? "Not provided"}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-white p-6 text-center text-[#64615C] sm:p-8">
          No locations found for your current search.
        </div>
      )}
    </section>
  );
}
