"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents, getUserEventRegistrations } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

function formatIcsDate(date: string, time: string) {
  const safeTime = time.slice(0, 5);
  return `${date.replaceAll("-", "")}T${safeTime.replace(":", "")}00`;
}

function downloadEventIcs(event: EventWithTags) {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Companion//EN",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@campuscompanion`,
    `DTSTAMP:${formatIcsDate(event.event_date, event.start_time)}`,
    `DTSTART:${formatIcsDate(event.event_date, event.start_time)}`,
    `DTEND:${formatIcsDate(event.event_date, event.end_time)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replaceAll("\n", " ")}`,
    `LOCATION:${event.location}${event.campus ? `, ${event.campus}` : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function recommendationScore(
  event: EventWithTags,
  campus: string | null | undefined,
  interests: string[] | null | undefined,
  preferredCategories: string[] | null | undefined,
) {
  let score = 0;
  if (campus && event.campus === campus) score += 3;
  if (preferredCategories?.includes(event.category)) score += 3;
  if (interests?.includes(event.category)) score += 2;
  return score;
}

export default function EventsPage() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [registrations, setRegistrations] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showIcsHelp, setShowIcsHelp] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCampus, setSelectedCampus] = useState("All");
  const [sortOrder, setSortOrder] = useState("recommended");
>>>>>>> 7b2d388c2a75330178304698715dbe15b052f76b

const allEvents = eventsData as Event[];

// ---------------------------------------------------------------------------
// Category badge colours
// ---------------------------------------------------------------------------

<<<<<<< HEAD
const CATEGORY_STYLES: Record<string, string> = {
  Academic: "bg-blue-100 text-blue-800",
  Career:   "bg-amber-100 text-amber-800",
  Sport:    "bg-green-100 text-green-800",
  Social:   "bg-purple-100 text-purple-800",
  Wellness: "bg-rose-100 text-rose-800",
  Arts:     "bg-orange-100 text-orange-800",
};
=======
  useEffect(() => {
    const loadRegistrations = async () => {
      if (!user) {
        setRegistrations([]);
        return;
      }
      const data = await getUserEventRegistrations(user.id);
      setRegistrations(data.map((item) => item.event_id));
    };

    void loadRegistrations();
  }, [user]);

  const categories = useMemo(
    () => ["All", ...new Set(events.map((event) => event.category))],
    [events],
  );
  const campuses = useMemo(
    () => [
      "All",
      ...new Set(
        events.map((event) => event.campus).filter(Boolean) as string[],
      ),
    ],
    [events],
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result =
      selectedCategory === "All"
        ? events
        : events.filter((event) => event.category === selectedCategory);

    if (selectedCampus !== "All") {
      result = result.filter((event) => event.campus === selectedCampus);
    }

    if (query) {
      result = result.filter((event) =>
        [
          event.title,
          event.category,
          event.location,
          event.campus ?? "",
          event.description,
          event.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    result = [...result].sort((a, b) => {
      if (sortOrder === "recommended") {
        const scoreDiff =
          recommendationScore(
            b,
            profile?.campus,
            profile?.interests,
            profile?.preferred_event_categories,
          ) -
          recommendationScore(
            a,
            profile?.campus,
            profile?.interests,
            profile?.preferred_event_categories,
          );
        if (scoreDiff !== 0) return scoreDiff;
      }
      const aValue = `${a.event_date} ${a.start_time}`;
      const bValue = `${b.event_date} ${b.start_time}`;
      return sortOrder === "desc"
        ? aValue > bValue
          ? -1
          : 1
        : aValue < bValue
          ? -1
          : 1;
    });

    return result;
  }, [
    events,
    profile?.campus,
    profile?.interests,
    profile?.preferred_event_categories,
    search,
    selectedCategory,
    selectedCampus,
    sortOrder,
  ]);

  const toggleRegister = async (eventItem: EventWithTags) => {
    if (!user) {
      setMessage("Please log in to register for events.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    const isRegistered = registrations.includes(eventItem.id);
    if (isRegistered) {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventItem.id);
      setRegistrations((current) =>
        current.filter((id) => id !== eventItem.id),
      );
      setMessage(`Unregistered from ${eventItem.title}.`);
    } else {
      await supabase
        .from("event_registrations")
        .insert({ user_id: user.id, event_id: eventItem.id });
      setRegistrations((current) => [...current, eventItem.id]);
      setMessage(`Registered for ${eventItem.title}.`);
    }
  };
>>>>>>> 7b2d388c2a75330178304698715dbe15b052f76b

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? "bg-gray-100 text-gray-800";
  return (
<<<<<<< HEAD
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {category}
    </span>
=======
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 sm:items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
              What&apos;s Happening
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[#111111]">
              Campus Events
            </h1>
            <p className="mt-2 text-sm text-[#64615C] sm:text-base">
              Discover upcoming events, workshops, and activities around campus.
            </p>
            <p className="mt-2 text-sm font-medium text-[#1F6C9F]">
              How not to miss your events
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIcsHelp((current) => !current)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#CFE6F4] bg-[#E1F3FE] text-base font-semibold text-[#1F6C9F] transition hover:border-[#A9D2E8] hover:bg-[#E1F3FE] sm:h-10 sm:w-10 sm:self-center"
            aria-label="How to add events to your calendar"
          >
            ?
          </button>
        </div>
      </div>

      {showIcsHelp && (
        <div className="rounded-xl border border-[#CFE6F4] bg-[#E1F3FE] p-5 text-sm text-[#164E73] ">
          <p className="font-semibold">How to add an event to your calendar</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Click <strong>Download ICS</strong> on an event.
            </li>
            <li>
              Open the downloaded file from your browser or downloads folder.
            </li>
            <li>
              Choose Microsoft Outlook / Calendar when prompted, or import the
              file manually.
            </li>
            <li>
              Confirm the event save so reminders show up when you need them.
            </li>
          </ol>
        </div>
      )}

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6">
        <div>
          <label
            htmlFor="event-search"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Search events
          </label>
          <input
            id="event-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, location, campus, description, or tag"
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="event-category"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Filter by category
            </label>
            <select
              id="event-category"
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
              htmlFor="event-campus"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Filter by campus
            </label>
            <select
              id="event-campus"
              value={selectedCampus}
              onChange={(event) => setSelectedCampus(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            >
              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sort-order"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Sort events
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            >
              <option value="recommended">Recommended for me</option>
              <option value="asc">Soonest first</option>
              <option value="desc">Latest first</option>
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {filteredEvents.map((event) => {
          const isRegistered = registrations.includes(event.id);
          const score = recommendationScore(
            event,
            profile?.campus,
            profile?.interests,
            profile?.preferred_event_categories,
          );
          return (
            <article
              key={event.id}
              className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap gap-2">
                <span className="inline-block rounded-full bg-[#F7F6F3] px-3 py-1 text-sm font-medium text-[#4A4844]">
                  {event.category}
                </span>
                {score > 0 && (
                  <span className="inline-block rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
                    Recommended
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[#111111]">
                {event.title}
              </h2>
              <p className="mt-2 text-sm text-[#787774]">
                {event.event_date} • {event.start_time} - {event.end_time}
              </p>
              <p className="mt-1 text-sm text-[#787774]">
                {event.location}
                {event.campus ? ` • ${event.campus}` : ""}
              </p>
              <p className="mt-4 text-sm text-[#64615C] sm:text-base">
                {event.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#E1F3FE] px-3 py-1 text-xs font-medium text-[#1F6C9F]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void toggleRegister(event)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${isRegistered ? "bg-[#4A4844]" : "bg-[#111111]"}`}
                >
                  {isRegistered ? "Registered" : "Register"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadEventIcs(event)}
                  className="rounded-xl border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
                >
                  Download ICS
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-white p-6 text-center text-[#64615C] sm:p-8">
          No events found for your current search or filters.
        </div>
      )}
    </section>
>>>>>>> 7b2d388c2a75330178304698715dbe15b052f76b
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