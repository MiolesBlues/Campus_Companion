"use client";

import { useEffect, useMemo, useState } from "react";
import { getEvents } from "@/lib/data";
import type { EventWithTags } from "@/types/database";

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };

    void loadEvents();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(events.map((event) => event.category))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    let result =
      selectedCategory === "All"
        ? events
        : events.filter((event) => event.category === selectedCategory);

    result = [...result].sort((a, b) => {
      const aValue = `${a.event_date} ${a.start_time}`;
      const bValue = `${b.event_date} ${b.start_time}`;

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : 1;
      }

      return aValue > bValue ? -1 : 1;
    });

    return result;
  }, [events, selectedCategory, sortOrder]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          What&apos;s Happening
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Events</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Discover upcoming events, workshops, and activities around campus.
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
        <div>
          <label htmlFor="event-category" className="mb-2 block text-sm font-medium text-slate-700">
            Filter by category
          </label>
          <select
            id="event-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none sm:max-w-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort-order" className="mb-2 block text-sm font-medium text-slate-700">
            Sort by date
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none sm:max-w-sm"
          >
            <option value="asc">Soonest first</option>
            <option value="desc">Latest first</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {event.category}
            </span>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">{event.title}</h2>

            <p className="mt-2 text-sm text-slate-500">
              {event.event_date} • {event.start_time}
            </p>

            <p className="mt-1 text-sm text-slate-500">{event.location}</p>

            <p className="mt-4 text-sm text-slate-600 sm:text-base">{event.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 shadow-sm sm:p-8">
          No events found for this category.
        </div>
      )}
    </section>
  );
}
