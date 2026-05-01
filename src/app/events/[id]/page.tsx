import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvents } from "@/lib/data";
import { getSimilarEvents, type Event } from "@/lib/ml/recommender";
import { EventActions } from "./event-actions";

export const dynamicParams = false;

const CATEGORY_STYLES: Record<string, string> = {
  Academic: "border-[#B8DEF3] bg-[#E1F3FE] text-[#1F6C9F]",
  Career: "border-[#ECD28B] bg-[#FBF3DB] text-[#956400]",
  Careers: "border-[#ECD28B] bg-[#FBF3DB] text-[#956400]",
  Sport: "border-[#BBD6B7] bg-[#EDF3EC] text-[#346538]",
  Sports: "border-[#BBD6B7] bg-[#EDF3EC] text-[#346538]",
  Social: "border-[#D8CBE8] bg-[#F1EDF8] text-[#6B5B7D]",
  Wellness: "border-[#F0C6C7] bg-[#FDEBEC] text-[#9F2F2D]",
  Arts: "border-[#ECD28B] bg-[#FBF3DB] text-[#956400]",
  Cultural: "border-[#F2CDAA] bg-[#FFF1E6] text-[#B85C00]",
  Technology: "border-[#B8DEF3] bg-[#E1F3FE] text-[#1F6C9F]",
};

function CategoryBadge({ category }: { category: string }) {
  const style =
    CATEGORY_STYLES[category] ??
    "border-[#D8D6D0] bg-[#F7F6F3] text-[#2F3437]";
  return (
    <span
      className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 text-sm font-semibold leading-none ${style}`}
    >
      {category}
    </span>
  );
}

function mapEventForRecommendations(
  event: Awaited<ReturnType<typeof getEvents>>[number],
): Event {
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

function InfoTile({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E2E0DA] bg-white/85 p-4 shadow-[0_18px_40px_-34px_rgba(17,17,17,0.45)] ${className}`}
    >
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#787774]">
        {label}
      </dt>
      <dd className="mt-2 text-base font-semibold leading-snug text-[#111111]">
        {value}
      </dd>
    </div>
  );
}

function SimilarEventCard({ event, score }: { event: Event; score: number }) {
  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex h-full flex-col gap-4 rounded-xl border border-[#E2E0DA] bg-[#FBFBFA] p-5 transition hover:-translate-y-1 hover:border-[#A9D2E8] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F6C9F]"
        aria-label={`View event: ${event.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-base font-semibold leading-snug text-[#111111] group-hover:text-[#1F6C9F]">
            {event.title}
          </span>
          <CategoryBadge category={event.category} />
        </div>

        <div className="mt-auto space-y-2 border-t border-[#EAEAEA] pt-4 text-sm text-[#64615C]">
          <p>{formatDate(event.date)}</p>
          <p>{event.time}</p>
          <p>{event.location}</p>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-[#EAEAEA]">
          <div
            className="h-full rounded-full bg-[#1F6C9F]"
            style={{ width: `${Math.max(8, Math.round(score * 100))}%` }}
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#787774]">
          {(score * 100).toFixed(1)}% match
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
  const dateLabel = formatDate(event.event_date);
  const timeLabel = `${event.start_time} - ${event.end_time}`;
  const campusLabel = event.campus ?? "Campus wide";

  return (
    <section className="relative -mx-4 -my-6 min-h-[100dvh] overflow-hidden bg-[#F7F6F3] sm:-mx-6 sm:-my-8 lg:-my-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_10%,rgba(31,108,159,0.16),transparent_34%),radial-gradient(circle_at_88%_4%,rgba(251,243,219,0.9),transparent_30%)]" />

      <header className="relative border-b border-[#E2E0DA] bg-[#FBFBFA]/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
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
              <li className="max-w-[12rem] truncate font-medium text-[#111111] sm:max-w-xs">
                {event.title}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <article aria-labelledby="event-title">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.14fr)_minmax(320px,0.86fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E0DA] bg-white p-6 shadow-[0_30px_80px_-58px_rgba(17,17,17,0.65)] sm:p-8 lg:p-10">
              <div className="absolute right-0 top-0 h-36 w-36 translate-x-10 -translate-y-12 rounded-full bg-[#E1F3FE]" />
              <div className="absolute bottom-0 right-10 h-20 w-40 translate-y-12 rounded-full bg-[#FBF3DB]" />

              <div className="relative flex flex-wrap items-center gap-3">
                <CategoryBadge category={event.category} />
                <span className="inline-flex min-h-8 items-center justify-center rounded-full border border-[#E2E0DA] bg-[#FBFBFA] px-3 py-1 text-sm font-semibold leading-none text-[#4A4844]">
                  {campusLabel}
                </span>
              </div>

              <h1
                id="event-title"
                className="relative mt-7 max-w-4xl text-4xl font-bold leading-[0.98] tracking-tight text-[#111111] sm:text-5xl lg:text-6xl"
              >
                {event.title}
              </h1>

              <p className="relative mt-6 max-w-2xl text-base leading-8 text-[#4A4844] sm:text-lg">
                {event.description}
              </p>

              <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/events"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#333333]"
                >
                  Back to events
                </Link>
                <a
                  href="#similar-heading"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8D6D0] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#A9D2E8] hover:bg-[#FBFBFA]"
                >
                  See similar events
                </a>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#D8D6D0] bg-[#111111] p-5 text-white shadow-[0_26px_80px_-56px_rgba(17,17,17,0.75)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A9D2E8]">
                Event snapshot
              </p>
              <dl className="mt-5 grid gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                    Date
                  </dt>
                  <dd className="mt-2 text-xl font-semibold leading-tight">
                    {dateLabel}
                  </dd>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                      Time
                    </dt>
                    <dd className="mt-2 font-semibold">{timeLabel}</dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                      Campus
                    </dt>
                    <dd className="mt-2 font-semibold">{campusLabel}</dd>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                    Location
                  </dt>
                  <dd className="mt-2 text-lg font-semibold leading-snug">
                    {event.location}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </article>

        <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-2xl border border-[#E2E0DA] bg-white p-6 sm:p-7">
            <h2 className="text-xl font-bold tracking-tight text-[#111111]">
              Plan your visit
            </h2>
            <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoTile label="Date" value={dateLabel} />
              <InfoTile label="Time" value={timeLabel} />
              <InfoTile label="Location" value={event.location} />
              <InfoTile label="Campus" value={campusLabel} />
            </dl>
          </div>

          <div className="rounded-2xl border border-[#E2E0DA] bg-white p-6 sm:p-7">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.48fr)]">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                  About this event
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#4A4844]">
                  {event.description}
                </p>

                {event.tags.length > 0 && (
                  <div className="mt-7 border-t border-[#EAEAEA] pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#787774]">
                      Tags
                    </h3>
                    <ul
                      className="mt-3 flex flex-wrap gap-2"
                      aria-label="Event tags"
                    >
                      {event.tags.map((tag) => (
                        <li key={tag}>
                          <span className="inline-flex min-h-8 items-center justify-center rounded-full border border-[#CFE6F4] bg-[#E1F3FE] px-3 py-1 text-xs font-semibold leading-none text-[#1F6C9F]">
                            #{tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <EventActions event={event} />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="similar-heading"
          className="rounded-2xl border border-[#E2E0DA] bg-white p-6 sm:p-7"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="similar-heading"
                className="text-2xl font-bold tracking-tight text-[#111111]"
              >
                Similar Events
              </h2>
              <p className="mt-1 text-sm text-[#64615C]">
                More campus moments that share this event&apos;s category, tags,
                or theme.
              </p>
            </div>
          </div>

          {similar.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#D8D6D0] bg-[#FBFBFA] p-5 text-[#64615C]">
              No similar events found.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3" role="list">
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
      </div>
    </section>
  );
}
