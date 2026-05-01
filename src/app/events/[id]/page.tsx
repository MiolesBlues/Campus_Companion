import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvents } from "@/lib/data";
import { getSimilarEvents, type Event } from "@/lib/ml/recommender";

export const dynamicParams = false;

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
      className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-sm font-medium leading-none ${style}`}
    >
      {category}
    </span>
  );
}

function mapEventForRecommendations(event: Awaited<ReturnType<typeof getEvents>>[number]): Event {
  return {
    id: String(event.id),
    title: event.title,
    category: event.category,
    description: event.description,
    date: event.event_date,
    time: `${event.start_time} - ${event.end_time}`,
    location: event.location,
    tags: event.tags ?? [],
  };
}

function SimilarEventCard({ event, score }: { event: Event; score: number }) {
  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex flex-col gap-1 rounded-xl border border-[#EAEAEA] bg-white p-4 transition hover:border-[#A9D2E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
        aria-label={`View event: ${event.title}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold leading-snug text-[#111111] group-hover:text-[#1F6C9F]">
            {event.title}
          </span>
          <CategoryBadge category={event.category} />
        </div>

        <p className="text-sm text-[#787774]">
          {formatDate(event.date)} · {event.time}
        </p>
        <p className="text-sm text-[#787774]">{event.location}</p>
        <p className="mt-1 text-xs text-[#9B9892]">
          Similarity: {(score * 100).toFixed(1)}%
        </p>
      </Link>
    </li>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ id: String(event.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const events = await getEvents();
  const event = events.find((item) => String(item.id) === id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | Campus Companion`,
    description: event.description,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const events = await getEvents();
  const event = events.find((item) => String(item.id) === id);

  if (!event) notFound();

  const recommendationEvents = events.map(mapEventForRecommendations);
  const similar = getSimilarEvents(String(event.id), recommendationEvents, 3);

  return (
    <section className="min-h-[100dvh] bg-[#F7F6F3]">
      <header className="border-b border-[#EAEAEA] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-[#787774]">
              <li>
                <Link
                  href="/"
                  className="rounded hover:text-[#1F6C9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/events"
                  className="rounded hover:text-[#1F6C9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
                >
                  Events
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-xs truncate font-medium text-[#111111]">
                {event.title}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <article aria-labelledby="event-title">
          <div className="space-y-5 rounded-xl border border-[#EAEAEA] bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start gap-3">
              <h1
                id="event-title"
                className="flex-1 text-2xl font-bold leading-tight text-[#111111]"
              >
                {event.title}
              </h1>
              <CategoryBadge category={event.category} />
            </div>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[#787774]">Date</dt>
                <dd className="text-[#111111]">{formatDate(event.event_date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#787774]">Time</dt>
                <dd className="text-[#111111]">
                  {event.start_time} - {event.end_time}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[#787774]">Location</dt>
                <dd className="text-[#111111]">{event.location}</dd>
              </div>
              {event.campus && (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-[#787774]">Campus</dt>
                  <dd className="text-[#111111]">{event.campus}</dd>
                </div>
              )}
            </dl>

            <div>
              <h2 className="mb-1 text-base font-semibold text-[#4A4844]">
                About this event
              </h2>
              <p className="leading-relaxed text-[#4A4844]">
                {event.description}
              </p>
            </div>

            {event.tags.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-[#787774]">
                  Tags
                </h2>
                <ul className="flex flex-wrap gap-2" aria-label="Event tags">
                  {event.tags.map((tag) => (
                    <li key={tag}>
                      <span className="inline-flex min-h-7 items-center justify-center rounded-full bg-[#E1F3FE] px-3 py-1 text-xs font-medium leading-none text-[#1F6C9F]">
                        #{tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        <section aria-labelledby="similar-heading">
          <h2
            id="similar-heading"
            className="mb-4 text-lg font-bold text-[#111111]"
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

        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 rounded text-sm text-[#1F6C9F] hover:text-[#164E73] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
          >
            Back to all events
          </Link>
        </div>
      </div>
    </section>
  );
}
