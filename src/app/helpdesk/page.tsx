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

    const { error: insertError } = await supabase
      .from("helpdesk_tickets")
      .insert({
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
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Support Desk
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">
            Helpdesk Support
          </h1>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Submit a support request for common campus and student service
            issues.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Issue category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
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
            <label
              htmlFor="urgency"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
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
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Describe the issue
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the issue here..."
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#111111] px-5 py-3 text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[#D5E5D1] bg-[#EDF3EC] p-4 text-sm text-[#346538] sm:text-base"
        >
          Your helpdesk request has been submitted successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-4 text-sm text-[#9F2F2D] sm:text-base">
          {error}
        </div>
      )}
    </section>
  );
}
