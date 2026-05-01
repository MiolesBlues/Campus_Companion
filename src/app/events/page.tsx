"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents, getUserEventRegistrations } from "@/lib/data";
import { downloadEventIcs } from "@/lib/ics";
import { eventRecommendationScore } from "@/lib/preferences";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

const CATEGORY_STYLES: Record<string, string> = {
  Academic: "bg-[#E1F3FE] text-[#1F6C9F]",
  Career: "bg-[#FBF3DB] text-[#956400]",
  Careers: "bg-[#FBF3DB] text-[#956400]",
  Sport: "bg-[#EDF3EC] text-[#346538]",
  Sports: "bg-[#EDF3EC] text-[#346538]",
  Social: "bg-[#F1EDF8] text-[#6B5B7D]",
  Wellness: "bg-[#FDEBEC] text-[#9F2F2D]",
  Arts: "bg-[#FBF3DB] text-[#956400]",
  Cultural: "bg-[#FFF1E6] text-[#B85C00]",
  Technology: "bg-[#E1F3FE] text-[#1F6C9F]",
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? "bg-[#F7F6F3] text-[#2F3437]";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${style}`}
    >
      {category}
    </span>
  );
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

  useEffect(() => {
    const loadEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };

    void loadEvents();
  }, []);

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

  const scoreByEventId = useMemo(() => {
    const map = new Map<number, number>();
    for (const event of events) {
      map.set(
        event.id,
        eventRecommendationScore(
          event,
          profile?.campus,
          profile?.interests,
          profile?.preferred_event_categories,
        ),
      );
    }
    return map;
  }, [
    events,
    profile?.campus,
    profile?.interests,
    profile?.preferred_event_categories,
  ]);

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

    return [...result].sort((a, b) => {
      if (sortOrder === "recommended") {
        const scoreDiff =
          (scoreByEventId.get(b.id) ?? 0) - (scoreByEventId.get(a.id) ?? 0);
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
  }, [events, scoreByEventId, search, selectedCategory, selectedCampus, sortOrder]);

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
      setRegistrations((current) => current.filter((id) => id !== eventItem.id));
      setMessage(`Unregistered from ${eventItem.title}.`);
      return;
    }

    await supabase
      .from("event_registrations")
      .insert({ user_id: user.id, event_id: eventItem.id });
    setRegistrations((current) => [...current, eventItem.id]);
    setMessage(`Registered for ${eventItem.title}.`);
  };

  return (
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

        {showIcsHelp && (
          <div className="rounded-xl border border-[#CFE6F4] bg-[#E1F3FE] p-4 text-sm text-[#164E73]">
            <p className="font-semibold">How to add an event to your calendar</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Click <strong>Download ICS</strong> on an event card.
              </li>
              <li>
                Open the downloaded file from your browser or downloads folder.
              </li>
              <li>Choose your calendar app, or import it manually.</li>
              <li>Confirm the event save so you get reminders later.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border border-[#EAEAEA] bg-white p-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
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
            placeholder="Search by title, category, campus, location, or tag"
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="event-category"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Category
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
            Campus
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
            htmlFor="event-sort"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Sort by
          </label>
          <select
            id="event-sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="asc">Date ascending</option>
            <option value="desc">Date descending</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C]">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => {
          const isRegistered = registrations.includes(event.id);
          return (
            <article
              key={event.id}
              className="flex h-full flex-col rounded-xl border border-[#EAEAEA] bg-white p-5"
            >
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={event.category} />
                {event.campus && (
                  <span className="rounded-full bg-[#EAEAEA] px-2.5 py-0.5 text-xs font-medium text-[#4A4844]">
                    {event.campus}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-semibold text-[#111111]">
                <Link href={`/events/${event.id}`} className="hover:underline">
                  {event.title}
                </Link>
              </h2>

              <p className="mt-2 text-sm text-[#64615C]">
                {event.event_date} - {event.start_time} - {event.end_time}
              </p>
              <p className="mt-1 text-sm text-[#64615C]">{event.location}</p>
              <p className="mt-3 text-sm text-[#64615C] sm:text-base">
                {event.description}
              </p>

              {event.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#D8D6D0] bg-[#FBFBFA] px-2.5 py-1 text-xs font-medium text-[#4A4844]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-3 pt-5">
                <button
                  type="button"
                  onClick={() => void toggleRegister(event)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isRegistered ? "border border-[#D8D6D0] bg-white text-[#111111] hover:bg-[#FBFBFA]" : "bg-[#111111] text-white hover:bg-[#333333]"}`}
                >
                  {isRegistered ? "Unregister" : "Register"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadEventIcs(event)}
                  className="rounded-xl border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
                >
                  Download ICS
                </button>
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-xl border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
                >
                  View details
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-white p-8 text-center text-[#64615C]">
          No events matched your filters.
        </div>
      )}
    </section>
  );
}
