"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import { getEvents, getUserEventRegistrations, getUserSocietyMemberships } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { courseOptions } from "@/lib/constants";
import { calculateAcademicYear, getEffectiveYearOfStudy } from "@/lib/profile";
import { getSocieties } from "@/lib/societies";
import type { EventWithTags, Society } from "@/types/database";

export default function AccountPage() {
  const { loading, user, profile, isConfigured, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [societyOptions, setSocietyOptions] = useState<Society[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventWithTags[]>([]);

  const effectiveYear = useMemo(() => getEffectiveYearOfStudy(profile), [profile]);
  const [course, setCourse] = useState(courseOptions[0]);
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([""]);

  useEffect(() => {
    const loadSocieties = async () => {
      const societies = await getSocieties();
      setSocietyOptions(societies);
    };

    void loadSocieties();
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setCourse(profile.course ?? courseOptions[0]);
    setStartYear(String(profile.start_year ?? new Date().getFullYear()));
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile]);

  useEffect(() => {
    const loadMembershipsAndEvents = async () => {
      if (!user) {
        setSelectedSocietyIds([""]);
        setRegisteredEvents([]);
        return;
      }

      const [memberships, registrations, events] = await Promise.all([
        getUserSocietyMemberships(user.id),
        getUserEventRegistrations(user.id),
        getEvents(),
      ]);

      setSelectedSocietyIds(memberships.length ? memberships.map((item) => String(item.society_id)) : [""]);
      const registeredIds = new Set(registrations.map((item) => item.event_id));
      setRegisteredEvents(events.filter((event) => registeredIds.has(event.id)));
    };

    void loadMembershipsAndEvents();
  }, [user]);

  const updateSociety = (index: number, value: string) => {
    setSelectedSocietyIds((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const addSocietyField = () => {
    setSelectedSocietyIds((current) => [...current, ""]);
  };

  const removeSocietyField = (index: number) => {
    setSelectedSocietyIds((current) => current.filter((_, i) => i !== index));
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

    const parsedStartYear = Number(startYear);
    const cleanSocieties = Array.from(new Set(selectedSocietyIds.filter(Boolean)))
      .map((id) => societyOptions.find((society) => society.id === Number(id)))
      .filter((society): society is Society => Boolean(society));

    const nextYear = profile?.role === "student" ? calculateAcademicYear(parsedStartYear) : profile?.year_of_study ?? null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        course,
        start_year: parsedStartYear,
        year_of_study: nextYear,
        avatar_url: avatarUrl || null,
        societies: cleanSocieties.map((society) => ({ society_id: society.id, name: society.name })),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await supabase.from("society_memberships").delete().eq("user_id", user.id);
    if (cleanSocieties.length > 0) {
      await supabase.from("society_memberships").insert(
        cleanSocieties.map((society) => ({ user_id: user.id, society_id: society.id }))
      );
    }

    await refreshProfile();
    setSelectedSocietyIds(cleanSocieties.length ? cleanSocieties.map((society) => String(society.id)) : [""]);
    setMessage("Account details updated successfully.");
    setSaving(false);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">My Account</span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">View and update your profile details, societies, registered events, and profile picture.</p>
        </div>
      </div>

      {!isConfigured && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">Supabase auth is not configured yet. Add your Supabase environment variables to enable login and account features.</div>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-slate-600">Loading your account...</p>
          ) : !user ? (
            <p className="text-slate-600">You are not logged in.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar src={avatarUrl || profile?.avatar_url || null} alt={profile?.full_name ?? user.email ?? "Profile picture"} size="lg" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Profile picture</p>
                    <p className="text-slate-900">Set an image URL or leave blank to use the default picture.</p>
                  </div>
                </div>
                <button type="button" onClick={() => void signOut()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">Sign out</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm font-medium text-slate-500">Email</p><p className="text-slate-900">{user.email}</p></div>
                <div><p className="text-sm font-medium text-slate-500">Full name</p><p className="text-slate-900">{profile?.full_name ?? "Not set"}</p></div>
                <div><p className="text-sm font-medium text-slate-500">Role</p><p className="text-slate-900">{profile?.role ?? "student"}</p></div>
                <div><p className="text-sm font-medium text-slate-500">Effective year of study</p><p className="text-slate-900">{effectiveYear ?? "Not set"}</p></div>
              </div>

              <form className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label htmlFor="account-avatar-url" className="mb-2 block text-sm font-medium text-slate-700">Profile picture URL</label>
                  <input id="account-avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" placeholder="https://example.com/avatar.jpg" />
                </div>

                <div>
                  <label htmlFor="account-course" className="mb-2 block text-sm font-medium text-slate-700">Course</label>
                  <select id="account-course" value={course} onChange={(event) => setCourse(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
                    {courseOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="account-start-year" className="mb-2 block text-sm font-medium text-slate-700">Academic start year</label>
                  <input id="account-start-year" type="number" min="2010" max="2100" value={startYear} onChange={(event) => setStartYear(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700">Societies</label>
                    <button type="button" onClick={addSocietyField} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">+ Add society</button>
                  </div>
                  {selectedSocietyIds.map((societyId, index) => (
                    <div key={`${index}-${societyId}`} className="flex gap-2">
                      <select value={societyId} onChange={(event) => updateSociety(index, event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
                        <option value="">Select a society</option>
                        {societyOptions.map((society) => (<option key={society.id} value={String(society.id)}>{society.name}</option>))}
                      </select>
                      {selectedSocietyIds.length > 1 && <button type="button" onClick={() => removeSocietyField(index)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Remove</button>}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">{saving ? "Saving..." : "Save changes"}</button>
              </form>

              {message && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Registered events</h2>
            <p className="mt-2 text-sm text-slate-600">Events you already signed up for.</p>
            <div className="mt-4 space-y-3">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.event_date} • {event.start_time} - {event.end_time}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.location}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">No registered events yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Society summary</h2>
            <p className="mt-2 text-sm text-slate-600">Your joined societies are kept in sync with your account.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSocietyIds.filter(Boolean).length > 0 ? (
                selectedSocietyIds
                  .filter(Boolean)
                  .map((id) => societyOptions.find((society) => society.id === Number(id)))
                  .filter((society): society is Society => Boolean(society))
                  .map((society) => (
                    <span key={society.id} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{society.name}</span>
                  ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">No societies selected yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
