"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { campusOptions } from "@/lib/constants";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SignupFields } from "@/components/auth/signup-fields";

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
  const [course, setCourse] = useState("Computer Science");
  const [campus, setCampus] = useState(campusOptions[0]);
  const [academicGroup, setAcademicGroup] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferredEventCategories, setPreferredEventCategories] = useState<string[]>([]);
  const [yearOfStudy, setYearOfStudy] = useState("1");
  const [startYear, setStartYear] = useState(String(currentAcademicStartYear()));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "student",
            course,
            campus,
            academic_group: academicGroup || null,
            interests: selectedInterests,
            preferred_event_categories: preferredEventCategories,
            year_of_study: Number(yearOfStudy),
            start_year: Number(startYear),
            societies: [],
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

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

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
          <SignupFields
            fullName={fullName}
            setFullName={setFullName}
            course={course}
            setCourse={setCourse}
            campus={campus}
            setCampus={setCampus}
            academicGroup={academicGroup}
            setAcademicGroup={setAcademicGroup}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            preferredEventCategories={preferredEventCategories}
            setPreferredEventCategories={setPreferredEventCategories}
            yearOfStudy={yearOfStudy}
            setYearOfStudy={setYearOfStudy}
            startYear={startYear}
            setStartYear={setStartYear}
          />
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" placeholder="student@example.com" required />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" placeholder="Enter your password" required />
        </div>

        <button type="submit" disabled={loading} className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      {message && <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    </div>
  );
}
