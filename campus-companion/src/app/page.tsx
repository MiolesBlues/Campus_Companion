import Link from "next/link";
import events from "@/data/events.json";

export default function Home() {
  const upcomingEvents = events.slice(0, 2);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">Campus Companion</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          A student helper app for finding events, locating campus services,
          and getting support quickly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/events"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <h2 className="text-xl font-semibold text-slate-900">Events</h2>
          <p className="mt-2 text-slate-600">
            Browse upcoming campus activities and workshops.
          </p>
        </Link>

        <Link
          href="/locations"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <h2 className="text-xl font-semibold text-slate-900">Locations</h2>
          <p className="mt-2 text-slate-600">
            Find key buildings, study spaces, and support services.
          </p>
        </Link>

        <Link
          href="/helpdesk"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <h2 className="text-xl font-semibold text-slate-900">Helpdesk</h2>
          <p className="mt-2 text-slate-600">
            Submit common issues and request student support.
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-medium text-slate-500">
                {event.date} • {event.time}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{event.location}</p>
              <p className="mt-3 text-slate-600">{event.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}