/**
 * src/app/events/[id]/page.tsx
 *
 * Individual event detail page.
 * Shows full event info + "Similar Events" section powered by TF-IDF recommender.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSimilarEvents, type Event } from "@/lib/ml/recommender";
import eventsData from "@/data/events.json";

const allEvents: Event[] = (eventsData as Array<Omit<Event, "id"> & { id: number | string }>).map(
  (e) => ({ ...e, id: String(e.id), tags: e.tags ?? [] }),
);

// ---------------------------------------------------------------------------
// Static params (pre-render all event pages at build time)
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return allEvents.map((e) => ({ id: e.id }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = allEvents.find((e) => e.id === id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | Campus Companion`,
    description: event.description,
  };
}

// ---------------------------------------------------------------------------
// Category badge colours (Tailwind safe-listed classes)
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
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${style}`}
    >
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Similar event card (compact)
// ---------------------------------------------------------------------------

function SimilarEventCard({
  event,
  score,
}: {
  event: Event;
  score: number;
}) {
  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
        aria-label={`View event: ${event.title}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-gray-900 group-hover:text-indigo-700 leading-snug">
            {event.title}
          </span>
          <CategoryBadge category={event.category} />
        </div>

        <p className="text-sm text-gray-500">
          {formatDate(event.date)} · {event.time}
        </p>
        <p className="text-sm text-gray-500">{event.location}</p>

        {/* Similarity score — useful for development/demo */}
        <p className="mt-1 text-xs text-gray-400">
          Similarity: {(score * 100).toFixed(1)}%
        </p>
      </Link>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = allEvents.find((e) => e.id === id);

  if (!event) notFound();

  const similar = getSimilarEvents(event.id, allEvents, 3);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header / nav ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link
                  href="/"
                  className="hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Events
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-gray-900 font-medium truncate max-w-xs">
                {event.title}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* ── Event detail ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <article aria-labelledby="event-title">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 md:p-8 space-y-5">
            {/* Title + category */}
            <div className="flex flex-wrap items-start gap-3">
              <h1
                id="event-title"
                className="text-2xl font-bold text-gray-900 leading-tight flex-1"
              >
                {event.title}
              </h1>
              <CategoryBadge category={event.category} />
            </div>

            {/* Meta row */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Date</dt>
                <dd className="text-gray-900">{formatDate(event.date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Time</dt>
                <dd className="text-gray-900">{event.time}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">Location</dt>
                <dd className="text-gray-900">{event.location}</dd>
              </div>
            </dl>

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-1">
                About this event
              </h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2">
                  Tags
                </h2>
                <ul
                  className="flex flex-wrap gap-2"
                  aria-label="Event tags"
                >
                  {event.tags.map((tag) => (
                    <li key={tag}>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        #{tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        {/* ── Similar events ───────────────────────────────────────── */}
        <section aria-labelledby="similar-heading">
          <h2
            id="similar-heading"
            className="text-lg font-bold text-gray-900 mb-4"
          >
            Similar Events
          </h2>

          {similar.length === 0 ? (
            <p className="text-gray-500">No similar events found.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="list">
              {similar.map((simEvt) => (
                <SimilarEventCard
                  key={simEvt.id}
                  event={simEvt}
                  score={simEvt.similarity}
                />
              ))}
            </ul>
          )}
        </section>

        {/* ── Back link ────────────────────────────────────────────── */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
          >
            ← Back to all events
          </Link>
        </div>
      </div>
    </main>
  );
}