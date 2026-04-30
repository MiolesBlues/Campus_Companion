"use client";

import { useEffect, useState } from "react";
import { getSocietiesList } from "@/lib/data";
import type { Society } from "@/types/database";

export default function SocietiesPage() {
  const [societies, setSocieties] = useState<Society[]>([]);

  useEffect(() => {
    const loadSocieties = async () => {
      const data = await getSocietiesList();
      setSocieties(data);
    };

    void loadSocieties();
  }, []);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {societies.map((society) => (
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
    </section>
  );
}
