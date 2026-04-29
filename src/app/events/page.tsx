"use client";

import { useMemo, useState } from "react";
import events from "@/data/events.json";

const categories = ["All", ...new Set(events.map((event) => event.category))];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");  // sorting by date

const filteredEvents = useMemo(() => {
  // categorical filter
  let result = selectedCategory === "All"
    ? events
    : events.filter((event) => event.category === selectedCategory);

  // date sorting
  result = [...result].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.date < b.date ? -1 : 1;
    } else {
      return a.date > b.date ? -1 : 1;
    }
  });

  return result;

}, [selectedCategory, sortOrder]);
    
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          What&apos;s Happening
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Events</h1>
          <p className="mt-2 text-slate-600">
            Discover upcoming events, workshops, and activities around campus.
          </p>
        </div>
      </div>

{/* Filter + Sort controls — CHANGED: added flex gap-6 to the wrapper div */}
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex gap-6">

  {/* Sort by Category*/}
  <div>
    <label
      htmlFor="event-category"
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      Filter by category
    </label>
    <select
      id="event-category"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>

  {/* Sort by date */}
  <div>
    <label
      htmlFor="sort-order"
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      Sort by date
    </label>
    <select
      id="sort-order"
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
    >
      <option value="asc">Soonest first</option>
      <option value="desc">Latest first</option>
    </select>
  </div>

</div>
       

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {event.category}
            </span>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {event.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {event.date} • {event.time}
            </p>

            <p className="mt-1 text-sm text-slate-500">{event.location}</p>

            <p className="mt-4 text-slate-600">{event.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
          No events found for this category.
        </div>
      )}
    </section>
  );
}
