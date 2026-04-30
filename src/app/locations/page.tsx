"use client";

import { useMemo, useState } from "react";
import locations from "@/data/locations.json";

const types = ["All", ...new Set(locations.map((location) => location.type))];

export default function LocationsPage() {
  const [selectedType, setSelectedType] = useState("All");

  const filteredLocations = useMemo(() => {
    if (selectedType === "All") return locations;
    return locations.filter((location) => location.type === selectedType);
  }, [selectedType]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Find Your Way
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Campus Locations
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Find important campus spaces, support centres, and study areas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="location-type"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Filter by type
        </label>
        <select
          id="location-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map((location) => (
          <article
            key={location.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {location.type}
            </span>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {location.name}
            </h2>

            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              {location.description}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-700">Opening hours:</span>{" "}
                {location.opening_hours}
              </p>
              <p>
                <span className="font-medium text-slate-700">
                  Accessibility:
                </span>{" "}
                {location.accessibility_notes}
              </p>
            </div>
          </article>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
          No locations found for this type.
        </div>
      )}
    </section>
  );
}