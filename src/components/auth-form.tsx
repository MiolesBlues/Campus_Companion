"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { courseOptions, yearOptions } from "@/lib/constants";
import { getSocieties } from "@/lib/societies";
import type { Society } from "@/types/database";

function currentAcademicStartYear(now = new Date()) {
  const month = now.getMonth();
  const year = now.getFullYear();
  return month >= 7 ? year : year - 1;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState(courseOptions[0]);
  const [yearOfStudy, setYearOfStudy] = useState("1");
  const [startYear, setStartYear] = useState(String(currentAcademicStartYear()));
  const [societyOptions, setSocietyOptions] = useState<Society[]>([]);
  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  useEffect(() => {
    if (!isSignup) {
      return;
    }

    const loadSocieties = async () => {
      const societies = await getSocieties();
      setSocietyOptions(societies);
    };

    void loadSocieties();
  }, [isSignup]);

  const updateSociety = (index: number, value: string) => {
    setSelectedSocietyIds((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const addSocietyField = () => {
    setSelectedSocietyIds((current) => [...current, ""]);
  };

  const removeSocietyField = (index: number) => {
    setSelectedSocietyIds((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase auth is not configured yet. Add your environment variables first.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setError("Supabase client could not be created.");
      setLoading(false);
      return;
    }

    if (isSignup) {
      const cleanSocieties = selectedSocietyIds
        .filter(Boolean)
        .map((id) => societyOptions.find((society) => society.id === Number(id)))
        .filter((society): society is Society => Boolean(society))
        .map((society) => ({ society_id: society.id, name: society.name }));

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "student",
            course,
            year_of_study: Number(yearOfStudy),
            start_year: Number(startYear),
            societies: cleanSocieties,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setMessage("Account created. Check your email to confirm your account.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <div>
              <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                placeholder="Alex Student"
                required
              />
            </div>

            <div>
              <label htmlFor="course" className="mb-2 block text-sm font-medium text-slate-700">
                Course
              </label>
              <select
                id="course"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                required
              >
                {courseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="year-of-study" className="mb-2 block text-sm font-medium text-slate-700">
                  Current year
                </label>
                <select
                  id="year-of-study"
                  value={yearOfStudy}
                  onChange={(event) => setYearOfStudy(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                  required
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="start-year" className="mb-2 block text-sm font-medium text-slate-700">
                  Started in academic year
                </label>
                <input
                  id="start-year"
                  type="number"
                  value={startYear}
                  onChange={(event) => setStartYear(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                  min="2010"
                  max="2100"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Societies (optional)
                </label>
                <button
                  type="button"
                  onClick={addSocietyField}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  + Add society
                </button>
              </div>

              {selectedSocietyIds.map((societyId, index) => (
                <div key={`${index}-${societyId}`} className="flex gap-2">
                  <select
                    value={societyId}
                    onChange={(event) => updateSociety(index, event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
                  >
                    <option value="">Select a society</option>
                    {societyOptions.map((society) => (
                      <option key={society.id} value={String(society.id)}>
                        {society.name}
                      </option>
                    ))}
                  </select>
                  {selectedSocietyIds.length > 1 && (
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
          </>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            placeholder="student@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      {message && <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    </div>
  );
}
