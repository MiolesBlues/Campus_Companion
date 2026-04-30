"use client";

import { FormEvent, useState } from "react";
import categories from "@/data/helpdesk-categories.json";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function HelpdeskPage() {
  const { user, profile } = useAuth();
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setError(null);

    if (!user || !profile) {
      setError("Please log in before submitting a helpdesk request.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("helpdesk_tickets").insert({
      user_id: user.id,
      category,
      urgency,
      subject: `${category} request`,
      description,
      status: "open",
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setCategory("");
    setUrgency("");
    setDescription("");
    setSubmitting(false);
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Support Desk
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Helpdesk Support</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Submit a support request for common campus and student service issues.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
              Issue category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="" disabled>
                Select an issue category
              </option>
              {categories.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className="mb-2 block text-sm font-medium text-slate-700">
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
              value={urgency}
              onChange={(event) => setUrgency(event.target.value)}
              required
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
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Describe the issue
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the issue here..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>

      {submitted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-sm sm:text-base">
          Your helpdesk request has been submitted successfully.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm sm:text-base">
          {error}
        </div>
      )}
    </section>
  );
}
