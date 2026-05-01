"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/data";
import type { EventWithTags } from "@/types/database";

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithTags[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const events = await getEvents();
      setUpcomingEvents(events.slice(0, 3));
    };

    void loadEvents();
  }, []);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Student Life Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Campus Companion</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          Your closed campus platform for events, timetables, societies, support, and day-to-day student life.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/account" className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700">Open my account</Link>
          <Link href="/events" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">Browse events</Link>
          <Link href="/timetables" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">Check timetable</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/events" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Events</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Register for upcoming campus talks, fairs, and student activities.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open events →</p>
        </Link>

        <Link href="/timetables" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Timetables</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Use a list for broad browsing or a compact grid for your exact course, year, and group.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open timetables →</p>
        </Link>

        <Link href="/societies" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Societies</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Find student communities, filter by category, and join what fits you.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open societies →</p>
        </Link>

        <Link href="/helpdesk" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Helpdesk</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Send support requests quickly when something on campus goes sideways.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open helpdesk →</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Upcoming events</h2>
            <p className="mt-1 text-sm text-slate-600">A quick look at the next 3 things happening on campus.</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-blue-700 hover:text-blue-900">View all</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="text-sm font-medium text-slate-500">{event.event_date} • {event.start_time}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{event.location}{event.campus ? ` • ${event.campus}` : ""}</p>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">{event.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
