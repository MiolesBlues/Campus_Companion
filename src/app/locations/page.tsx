import locations from "@/data/locations.json";

export default function LocationsPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Find Your Way
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Campus Locations
          </h1>
          <p className="mt-2 text-slate-600">
            Find important campus spaces, support centres, and study areas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <article
            key={location.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {location.type}
            </span>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {location.name}
            </h2>

            <p className="mt-3 text-slate-600">{location.description}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-700">Opening hours:</span>{" "}
                {location.opening_hours}
              </p>
              <p>
                <span className="font-medium text-slate-700">
                  Accessibility:
                </span>{" "}
                {location.accessibility_notes}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
