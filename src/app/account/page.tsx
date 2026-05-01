"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import { campusOptions, courseOptions } from "@/lib/constants";
import { getEvents, getUserEventRegistrations } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { calculateAcademicYear, getEffectiveYearOfStudy } from "@/lib/profile";
import type { EventWithTags } from "@/types/database";

function formatIcsDate(date: string, time: string) {
  const safeTime = time.slice(0, 5);
  return `${date.replaceAll("-", "")}T${safeTime.replace(":", "")}00`;
}

function downloadEventIcs(event: EventWithTags) {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Companion//EN",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@campuscompanion`,
    `DTSTAMP:${formatIcsDate(event.event_date, event.start_time)}`,
    `DTSTART:${formatIcsDate(event.event_date, event.start_time)}`,
    `DTEND:${formatIcsDate(event.event_date, event.end_time)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replaceAll("\n", " ")}`,
    `LOCATION:${event.location}${event.campus ? `, ${event.campus}` : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function AccountPage() {
  const { loading, user, profile, isConfigured, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<EventWithTags[]>([]);
  const [showIcsHelp, setShowIcsHelp] = useState(true);

  const effectiveYear = useMemo(() => getEffectiveYearOfStudy(profile), [profile]);
  const [course, setCourse] = useState(courseOptions[0]);
  const [campus, setCampus] = useState(campusOptions[0]);
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setCourse(profile.course ?? courseOptions[0]);
    setCampus(profile.campus ?? campusOptions[0]);
    setStartYear(String(profile.start_year ?? new Date().getFullYear()));
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!user) {
        setRegisteredEvents([]);
        return;
      }

      const [registrations, events] = await Promise.all([
        getUserEventRegistrations(user.id),
        getEvents(),
      ]);

      const registeredIds = new Set(registrations.map((item) => item.event_id));
      setRegisteredEvents(events.filter((event) => registeredIds.has(event.id)));
    };

    void loadEvents();
  }, [user]);

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
    const nextYear = profile?.role === "student" ? calculateAcademicYear(parsedStartYear) : profile?.year_of_study ?? null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        course,
        campus,
        start_year: parsedStartYear,
        year_of_study: nextYear,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="account-course" className="mb-2 block text-sm font-medium text-slate-700">Course</label>
                    <select id="account-course" value={course} onChange={(event) => setCourse(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
                      {courseOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="account-campus" className="mb-2 block text-sm font-medium text-slate-700">Campus</label>
                    <select id="account-campus" value={campus} onChange={(event) => setCampus(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
                      {campusOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="account-start-year" className="mb-2 block text-sm font-medium text-slate-700">Academic start year</label>
                  <input id="account-start-year" type="number" min="2010" max="2100" value={startYear} onChange={(event) => setStartYear(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none" />
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
            <h2 className="text-xl font-semibold text-slate-900">My societies</h2>
            <p className="mt-2 text-sm text-slate-600">The societies you joined across the platform.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.societies && profile.societies.length > 0 ? (
                profile.societies.map((society) => (
                  <span key={society.society_id} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{society.name}</span>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">You haven&apos;t joined any societies yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Registered events</h2>
                <p className="mt-1 text-sm text-blue-700">How not to miss your events</p>
              </div>
              <button type="button" onClick={() => setShowIcsHelp((current) => !current)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-blue-200 bg-blue-50 text-base font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100" aria-label="How to add events to your calendar">
                ?
              </button>
            </div>

            {showIcsHelp && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">How to add an event to your calendar</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Click <strong>Download ICS</strong> on any registered event.</li>
                  <li>Open the downloaded file from your browser or downloads folder.</li>
                  <li>Choose Microsoft Outlook / Calendar when prompted, or import it manually into your calendar app.</li>
                  <li>Confirm the event save so you get reminders later.</li>
                </ol>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.event_date} • {event.start_time} - {event.end_time}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.location}{event.campus ? ` • ${event.campus}` : ""}</p>
                    <button type="button" onClick={() => downloadEventIcs(event)} className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                      Download ICS
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">No registered events yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
