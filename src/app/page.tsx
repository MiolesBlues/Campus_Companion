"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/data";
import type { EventRecord } from "@/types/database";

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventRecord[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const events = await getEvents();
      setUpcomingEvents(events.slice(0, 2));
    };

    void loadEvents();
  }, []);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Student Life Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Campus Companion</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          A student helper app for finding events, checking timetables, locating campus services, and getting support quickly.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/events" className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700">
            Go to Events
          </Link>
          <Link href="/timetables" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
            Go to Timetables
          </Link>
          <Link href="/locations" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
            Go to Locations
          </Link>
          <Link href="/helpdesk" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
            Go to Helpdesk
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/events" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Events</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Browse upcoming campus activities and workshops.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open events →</p>
        </Link>

        <Link href="/timetables" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Timetables</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Check student schedules with filters for courses and year groups.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open timetables →</p>
        </Link>

        <Link href="/locations" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Locations</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Find key buildings, study spaces, and support services.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open locations →</p>
        </Link>

        <Link href="/helpdesk" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Helpdesk</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Submit common issues and request student support.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open helpdesk →</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Upcoming Events</h2>
          <Link href="/events" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="text-sm font-medium text-slate-500">
                {event.event_date} • {event.start_time}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{event.location}</p>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">{event.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
