import Link from "next/link";
import { notFound } from "next/navigation";
import { getSimilarEvents, type Event } from "@/lib/ml/recommender";
import eventsData from "@/data/events.json";

const allEvents = eventsData as Event[];

export function generateStaticParams() {
  return allEvents.map((e) => ({ id: e.id }));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = allEvents.find((e) => e.id === params.id);

  if (!event) notFound();

  const similar = getSimilarEvents(event.id, allEvents, 3);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p>{formatDate(event.date)}</p>
      <p>{event.time}</p>
      <p>{event.location}</p>
      <p className="mt-4">{event.description}</p>

      <h2 className="mt-8 text-xl font-semibold">Similar Events</h2>

      <ul className="mt-4 space-y-2">
        {similar.map((item: any) => {
          const simEvt = item.event ?? item;

          return (
            <li key={simEvt.id}>
              <Link href={`/events/${simEvt.id}`} className="text-blue-600 underline">
                {simEvt.title} ({simEvt.category})
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <Link href="/events" className="text-blue-600 underline">
          ← Back to events
        </Link>
      </div>
    </main>
  );
}