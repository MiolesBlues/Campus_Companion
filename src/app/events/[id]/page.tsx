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

const allEvents: Event[] = (
  eventsData as Array<Omit<Event, "id"> & { id: number | string }>
).map((e) => ({ ...e, id: String(e.id), tags: e.tags ?? [] }));

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
  Academic: "bg-[#E1F3FE] text-[#1F6C9F]",
  Career: "bg-[#FBF3DB] text-[#956400]",
  Sport: "bg-[#EDF3EC] text-[#346538]",
  Social: "bg-[#F1EDF8] text-[#6B5B7D]",
  Wellness: "bg-[#FDEBEC] text-[#9F2F2D]",
  Arts: "bg-[#FBF3DB] text-[#956400]",
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

// ---------------------------------------------------------------------------
// Similar event card (compact)
// ---------------------------------------------------------------------------

function SimilarEventCard({ event, score }: { event: Event; score: number }) {
  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex flex-col gap-1 rounded-xl border border-[#EAEAEA] bg-white p-4 transition hover:border-[#A9D2E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
        aria-label={`View event: ${event.title}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-[#111111] group-hover:text-[#1F6C9F] leading-snug">
            {event.title}
          </span>
          <CategoryBadge category={event.category} />
        </div>

        <p className="text-sm text-[#787774]">
          {formatDate(event.date)} · {event.time}
        </p>
        <p className="text-sm text-[#787774]">{event.location}</p>

        {/* Similarity score — useful for development/demo */}
        <p className="mt-1 text-xs text-[#9B9892]">
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
    <section className="min-h-[100dvh] bg-[#F7F6F3]">
      {/* ── Header / nav ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-[#787774]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#1F6C9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F] rounded"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-[#1F6C9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F] rounded"
                >
                  Events
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#111111] font-medium truncate max-w-xs">
                {event.title}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* ── Event detail ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <article aria-labelledby="event-title">
          <div className="rounded-xl bg-white border border-[#EAEAEA] p-6 md:p-8 space-y-5">
            {/* Title + category */}
            <div className="flex flex-wrap items-start gap-3">
              <h1
                id="event-title"
                className="text-2xl font-bold text-[#111111] leading-tight flex-1"
              >
                {event.title}
              </h1>
              <CategoryBadge category={event.category} />
            </div>

            {/* Meta row */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium text-[#787774]">Date</dt>
                <dd className="text-[#111111]">{formatDate(event.date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#787774]">Time</dt>
                <dd className="text-[#111111]">{event.time}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[#787774]">Location</dt>
                <dd className="text-[#111111]">{event.location}</dd>
              </div>
            </dl>

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-[#4A4844] mb-1">
                About this event
              </h2>
              <p className="text-[#4A4844] leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#787774] mb-2">
                  Tags
                </h2>
                <ul className="flex flex-wrap gap-2" aria-label="Event tags">
                  {event.tags.map((tag) => (
                    <li key={tag}>
                      <span className="rounded-full bg-[#E1F3FE] px-3 py-1 text-xs font-medium text-[#1F6C9F]">
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
            className="text-lg font-bold text-[#111111] mb-4"
          >
            Similar Events
          </h2>

          {similar.length === 0 ? (
            <p className="text-[#787774]">No similar events found.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
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
            className="inline-flex items-center gap-1 text-sm text-[#1F6C9F] hover:text-[#164E73] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F] rounded"
          >
            Back to all events
          </Link>
        </div>
      </div>
    </section>
  );
}
