"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents, getUserEventRegistrations } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

function formatIcsDate(date: string, time: string) {
  const safeTime = time.slice(0, 5);
  return `${date.replaceAll("-", "") }T${safeTime.replace(":", "")}00`;
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
    `LOCATION:${event.location}`,
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

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [registrations, setRegistrations] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const categories = useMemo(() => ["All", ...new Set(events.map((event) => event.category))], [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = selectedCategory === "All" ? events : events.filter((event) => event.category === selectedCategory);

    if (query) {
      result = result.filter((event) =>
        [event.title, event.category, event.location, event.description, event.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      const aValue = `${a.event_date} ${a.start_time}`;
      const bValue = `${b.event_date} ${b.start_time}`;
      return sortOrder === "asc" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
    });

    return result;
  }, [events, search, selectedCategory, sortOrder]);

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
      await supabase.from("event_registrations").delete().eq("user_id", user.id).eq("event_id", eventItem.id);
      setRegistrations((current) => current.filter((id) => id !== eventItem.id));
      setMessage(`Unregistered from ${eventItem.title}.`);
    } else {
      await supabase.from("event_registrations").insert({ user_id: user.id, event_id: eventItem.id });
      setRegistrations((current) => [...current, eventItem.id]);
      setMessage(`Registered for ${eventItem.title}.`);
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">What&apos;s Happening</span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Events</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Discover upcoming events, workshops, and activities around campus.</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 sm:p-6">
        <div>
          <label htmlFor="event-search" className="mb-2 block text-sm font-medium text-slate-700">Search events</label>
          <input id="event-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, location, description, or tag" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="event-category" className="mb-2 block text-sm font-medium text-slate-700">Filter by category</label>
          <select id="event-category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
            {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="sort-order" className="mb-2 block text-sm font-medium text-slate-700">Sort by date</label>
          <select id="sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
            <option value="asc">Soonest first</option>
            <option value="desc">Latest first</option>
          </select>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">{message}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const isRegistered = registrations.includes(event.id);
          return (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{event.category}</span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{event.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{event.event_date} • {event.start_time} - {event.end_time}</p>
              <p className="mt-1 text-sm text-slate-500">{event.location}</p>
              <p className="mt-4 text-sm text-slate-600 sm:text-base">{event.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{event.tags.map((tag) => (<span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">#{tag}</span>))}</div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => void toggleRegister(event)} className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${isRegistered ? "bg-slate-600" : "bg-slate-900"}`}>
                  {isRegistered ? "Registered" : "Register"}
                </button>
                <button type="button" onClick={() => downloadEventIcs(event)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                  Download ICS
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600 shadow-sm sm:p-8">No events found for your current search or category.</div>}
    </section>
  );
}
