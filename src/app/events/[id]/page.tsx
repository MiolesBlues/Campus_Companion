import Link from "next/link";
import { notFound } from "next/navigation";
import events from "@/data/events.json";
import { getSimilarEvents } from "@/lib/ml/recommender";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const event = events.find((event) => event.id === id);

  if (!event) {
    notFound();
  }

  const similarEvents = getSimilarEvents(event.id, events, 3);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/events" className="underline">
        ← Back to events
      </Link>

      <article className="mt-6 rounded-xl border p-6">
        <p className="text-sm font-medium">{event.category}</p>
        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>

        <p className="mt-4">
          {event.date} at {event.time}
        </p>

        <p className="mt-2">{event.location}</p>

        <p className="mt-6">{event.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {event.tags?.map((tag) => (
            <span key={tag} className="rounded-full border px-3 py-1 text-sm">
              {tag}
            </span>
          ))}
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Similar events</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {similarEvents.map((similarEvent) => (
            <Link
              key={similarEvent.id}
              href={`/events/${similarEvent.id}`}
              className="rounded-xl border p-4 hover:shadow focus:outline"
            >
              <h3 className="font-semibold">{similarEvent.title}</h3>
              <p className="mt-2 text-sm">{similarEvent.category}</p>
              <p className="mt-2 text-sm">
                {similarEvent.date} at {similarEvent.time}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}