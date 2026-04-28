import categories from "@/data/helpdesk-categories.json";

export default function HelpdeskPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Helpdesk Support</h1>
        <p className="mt-2 text-slate-600">
          Submit a support request for common campus and student service issues.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-5">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Issue category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select an issue category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="urgency"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select urgency level
              </option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Describe the issue
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the issue here..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
          >
            Submit request
          </button>
        </form>
      </div>
    </section>
  );
}