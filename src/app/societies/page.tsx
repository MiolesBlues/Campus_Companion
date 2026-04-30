"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocietiesList } from "@/lib/data";
import type { Society } from "@/types/database";

export default function SocietiesPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadSocieties = async () => {
      const data = await getSocietiesList();
      setSocieties(data);
    };

    void loadSocieties();
  }, []);

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

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Student Communities
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Societies</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Explore clubs and societies across campus and find your people.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label htmlFor="society-search" className="mb-2 block text-sm font-medium text-slate-700">
          Search societies
        </label>
        <input
          id="society-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, category, description, contact, or meeting day"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSocieties.map((society) => (
          <article key={society.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {society.category}
            </span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">{society.name}</h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">{society.description}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-700">Meeting day:</span>{" "}
                {society.meeting_day ?? "Not listed"}
              </p>
              <p>
                <span className="font-medium text-slate-700">Contact:</span>{" "}
                {society.contact_email ?? "Not listed"}
              </p>
            </div>
          </article>
        ))}
      </div>

      {filteredSocieties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 shadow-sm sm:p-8">
          No societies found for your current search.
        </div>
      )}
    </section>
  );
}
