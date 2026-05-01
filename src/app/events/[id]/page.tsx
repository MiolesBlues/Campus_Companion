import Link from "next/link";
import { notFound } from "next/navigation";
import { getSimilarEvents, type Event } from "@/lib/ml/recommender";
import eventsData from "@/data/events.json";

const allEvents = eventsData as Event[];

export function generateStaticParams() {
  return allEvents.map((event) => ({ id: event.id }));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = allEvents.find((item) => item.id === id);

  if (!event) {
    notFound();
  }

  const similar = getSimilarEvents(event.id, allEvents, 3);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
        <Link href="/events" className="text-blue-600 underline">
          ← Back to events
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">{event.title}</h1>

        <div className="mt-4 space-y-1 text-gray-600">
          <p>Category: {event.category}</p>
          <p>Date: {formatDate(event.date)}</p>
          <p>Time: {event.time}</p>
          <p>Location: {event.location}</p>
        </div>

        <p className="mt-6 text-gray-700">{event.description}</p>

        <h2 className="mt-8 text-xl font-semibold text-gray-900">
          Similar Events
        </h2>

        <ul className="mt-4 space-y-3">
          {similar.map((item: any) => {
            const simEvt = item.event ?? item;

            return (
              <li key={simEvt.id} className="rounded-lg border p-3">
                <Link
                  href={`/events/${simEvt.id}`}
                  className="font-medium text-blue-600 underline"
                >
                  {simEvt.title} ({simEvt.category})
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
