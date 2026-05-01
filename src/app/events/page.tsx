"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/ml/recommender";

const allEvents = eventsData as Event[];

const CATEGORIES = ["All", ...Array.from(new Set(allEvents.map((e) => e.category))).sort()];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const displayedEvents = useMemo(() => {
    const filtered =
      selectedCategory === "All"
        ? allEvents
        : allEvents.filter((e) => e.category === selectedCategory);

    return [...filtered].sort((a, b) => {
      const diff = a.date.localeCompare(b.date);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [selectedCategory, sortOrder]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Click any event to view details and similar recommendations.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section aria-label="Filter and sort events">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="asc">Date: Earliest first</option>
              <option value="desc">Date: Latest first</option>
            </select>

            <p className="ml-auto text-sm text-gray-500">
              {displayedEvents.length} events
            </p>
          </div>
        </section>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-400 hover:shadow-md"
              >
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {event.category}
                </span>

                <h2 className="mt-3 text-base font-semibold text-gray-900">
                  {event.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  📅 {formatDate(event.date)}
                </p>
                <p className="text-sm text-gray-500">🕐 {event.time}</p>
                <p className="text-sm text-gray-500">📍 {event.location}</p>

                <p className="mt-3 text-sm text-gray-600">
                  {event.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}