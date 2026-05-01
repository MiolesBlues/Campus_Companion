"use client";

/**
 * src/app/events/page.tsx
 *
 * Events list page.
 * - Category filter (unchanged logic)
 * - Date sort (unchanged logic)
 * - Each event card is now a <Link> to /events/[id]   ← new
 *
 * The filter and sort state is managed client-side via useState,
 * exactly as before — no breakage.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/ml/recommender";

const allEvents = eventsData as Event[];

// ---------------------------------------------------------------------------
// Category badge colours
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, string> = {
  Academic: "bg-blue-100 text-blue-800",
  Career:   "bg-amber-100 text-amber-800",
  Sport:    "bg-green-100 text-green-800",
  Social:   "bg-purple-100 text-purple-800",
  Wellness: "bg-rose-100 text-rose-800",
  Arts:     "bg-orange-100 text-orange-800",
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Derive unique categories for the filter UI
// ---------------------------------------------------------------------------

const CATEGORIES = ["All", ...Array.from(new Set(allEvents.map((e) => e.category))).sort()];

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EventsPage() {
  // ── Filter & sort state ──────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ── Filtered + sorted events (unchanged logic) ───────────────────────────
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
      {/* ── Page header ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            {allEvents.length} events · click any event to see details and
            similar recommendations
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* ── Filters & sort ─────────────────────────────────────── */}
        <section aria-label="Filter and sort events">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category filter */}
            <div>
              <label
                htmlFor="category-filter"
                className="sr-only"
              >
                Filter by category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date sort */}
            <div>
              <label htmlFor="sort-order" className="sr-only">
                Sort by date
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "asc" | "desc")
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="asc">Date: Earliest first</option>
                <option value="desc">Date: Latest first</option>
              </select>
            </div>

            {/* Result count */}
            <p className="ml-auto text-sm text-gray-500" aria-live="polite">
              {displayedEvents.length} event
              {displayedEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* ── Event list ─────────────────────────────────────────── */}
        {displayedEvents.length === 0 ? (
          <p className="text-gray-500">No events match your filter.</p>
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Events list"
          >
            {displayedEvents.map((event) => (
              <li key={event.id}>
                {/*
                 * Each event card is now a Link — the ONLY change to the
                 * existing card markup; filter and sort logic is untouched.
                 */}
                <Link
                  href={`/events/${event.id}`}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                  aria-label={`View details for ${event.title}`}
                >
                  {/* Category badge */}
                  <div className="mb-3">
                    <CategoryBadge category={event.category} />
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 leading-snug mb-2">
                    {event.title}
                  </h2>

                  {/* Date / time / location */}
                  <dl className="mt-auto space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <dt className="sr-only">Date</dt>
                      <dd>📅 {formatDate(event.date)}</dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <dt className="sr-only">Time</dt>
                      <dd>🕐 {event.time}</dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <dt className="sr-only">Location</dt>
                      <dd>📍 {event.location}</dd>
                    </div>
                  </dl>

                  {/* Snippet */}
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Tags (up to 3) */}
                  {event.tags.length > 0 && (
                    <ul
                      className="mt-3 flex flex-wrap gap-1"
                      aria-label={`Tags for ${event.title}`}
                    >
                      {event.tags.slice(0, 3).map((tag) => (
                        <li key={tag}>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                            #{tag}
                          </span>
                        </li>
                      ))}
                      {event.tags.length > 3 && (
                        <li>
                          <span className="text-xs text-gray-400">
                            +{event.tags.length - 3} more
                          </span>
                        </li>
                      )}
                    </ul>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}