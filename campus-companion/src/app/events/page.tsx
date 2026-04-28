import events from "@/data/events.json";

export default function EventsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Campus Events</h1>
        <p className="mt-2 text-slate-600">
          Discover upcoming events, workshops, and activities around campus.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
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
    </section>
  );
}