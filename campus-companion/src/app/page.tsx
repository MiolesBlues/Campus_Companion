export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900">Campus Companion</h1>
        <p className="mt-3 text-lg text-slate-600">
          Your student helper app for events, locations, and support services.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Events</h2>
          <p className="mt-2 text-slate-600">
            Browse upcoming campus activities and student events.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Locations</h2>
          <p className="mt-2 text-slate-600">
            Find important buildings, rooms, and services on campus.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Helpdesk</h2>
          <p className="mt-2 text-slate-600">
            Report common student issues and get support quickly.
          </p>
        </div>
      </div>
    </section>
  );
}