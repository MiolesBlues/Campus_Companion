"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { courseOptions, yearOptions } from "@/lib/constants";
import { getEffectiveYearOfStudy } from "@/lib/profile";

export default function AccountPage() {
  const { loading, user, profile, isConfigured } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveYear = useMemo(() => getEffectiveYearOfStudy(profile), [profile]);
  const [course, setCourse] = useState(profile?.course ?? courseOptions[0]);
  const [startYear, setStartYear] = useState(String(profile?.start_year ?? new Date().getFullYear()));
  const [societies, setSocieties] = useState<string[]>(
    profile?.societies?.length ? profile.societies.map((item) => item.name) : [""]
  );

  const updateSociety = (index: number, value: string) => {
    setSocieties((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const addSocietyField = () => {
    setSocieties((current) => [...current, ""]);
  };

  const removeSocietyField = (index: number) => {
    setSocieties((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase || !user) {
      setError("Supabase or user session is unavailable.");
      setSaving(false);
      return;
    }

    const cleanSocieties = societies
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const nextYear = profile?.role === "student" ? Number(yearOptions.includes(Number(getEffectiveYearOfStudy({ ...profile, course, start_year: Number(startYear), societies: cleanSocieties, year_of_study: profile?.year_of_study ?? 1 } as never) ?? 1)) ? getEffectiveYearOfStudy({ ...profile, course, start_year: Number(startYear), societies: cleanSocieties, year_of_study: profile?.year_of_study ?? 1 } as never) : profile?.year_of_study ?? 1) : null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        course,
        start_year: Number(startYear),
        year_of_study: nextYear,
        societies: cleanSocieties,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Account details updated successfully.");
    setSaving(false);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          My Account
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">
            View and update your course, societies, and role-aware profile details.
          </p>
        </div>
      </div>

      {!isConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          Supabase auth is not configured yet. Add your Supabase environment variables to enable login and account features.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading your account...</p>
        ) : !user ? (
          <p className="text-slate-600">You are not logged in.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p className="text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Full name</p>
                <p className="text-slate-900">{profile?.full_name ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Role</p>
                <p className="text-slate-900">{profile?.role ?? "student"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Effective year of study</p>
                <p className="text-slate-900">{effectiveYear ?? "Not set"}</p>
              </div>
            </div>

            {profile?.role === "student" && (
              <form className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label htmlFor="account-course" className="mb-2 block text-sm font-medium text-slate-700">
                    Course
                  </label>
                  <select
                    id="account-course"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                  >
                    {courseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="account-start-year" className="mb-2 block text-sm font-medium text-slate-700">
                    Academic start year
                  </label>
                  <input
                    id="account-start-year"
                    type="number"
                    min="2010"
                    max="2100"
                    value={startYear}
                    onChange={(event) => setStartYear(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700">Societies</label>
                    <button
                      type="button"
                      onClick={addSocietyField}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      + Add society
                    </button>
                  </div>

                  {societies.map((society, index) => (
                    <div key={`${index}-${society}`} className="flex gap-2">
                      <input
                        type="text"
                        value={society}
                        onChange={(event) => updateSociety(index, event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                        placeholder="e.g. Drama Society"
                      />
                      {societies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocietyField(index)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            )}

            {profile?.role === "teacher" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                Teachers can view their own timetable automatically. Course and society editing is student-only.
              </div>
            )}

            {message && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
