"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import {
  academicGroupOptions,
  campusOptions,
  courseOptions,
  eventCategoryOptions,
  interestOptions,
} from "@/lib/constants";
import { getEvents, getUserEventRegistrations } from "@/lib/data";
import { calculateAcademicYear, getEffectiveYearOfStudy } from "@/lib/profile";
import { getSocieties } from "@/lib/societies";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags, Society } from "@/types/database";

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

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function AccountPage() {
  const { loading, user, profile, isConfigured, refreshProfile, signOut } =
    useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<EventWithTags[]>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[]>([]);
  const [showIcsHelp, setShowIcsHelp] = useState(true);

  const effectiveYear = useMemo(
    () => getEffectiveYearOfStudy(profile),
    [profile],
  );
  const [course, setCourse] = useState(courseOptions[0]);
  const [campus, setCampus] = useState(campusOptions[0]);
  const [academicGroup, setAcademicGroup] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferredEventCategories, setPreferredEventCategories] = useState<
    string[]
  >([]);
  const [preferredSocietyCategories, setPreferredSocietyCategories] = useState<
    string[]
  >([]);
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setCourse(profile.course ?? courseOptions[0]);
    setCampus(profile.campus ?? campusOptions[0]);
    setAcademicGroup(profile.academic_group ?? "");
    setSelectedInterests(profile.interests ?? []);
    setPreferredEventCategories(profile.preferred_event_categories ?? []);
    setPreferredSocietyCategories(profile.preferred_society_categories ?? []);
    setStartYear(String(profile.start_year ?? new Date().getFullYear()));
    setAvatarUrl(profile.avatar_url ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  useEffect(() => {
    const loadSidebarData = async () => {
      const allSocieties = await getSocieties();
      const joinedIds = new Set(
        (profile?.societies ?? []).map((society) => society.society_id),
      );
      setJoinedSocieties(
        allSocieties.filter((society) => joinedIds.has(society.id)),
      );

      if (!user) {
        setRegisteredEvents([]);
        return;
      }

      const [registrations, events] = await Promise.all([
        getUserEventRegistrations(user.id),
        getEvents(),
      ]);

      const registeredIds = new Set(registrations.map((item) => item.event_id));
      setRegisteredEvents(
        events.filter((event) => registeredIds.has(event.id)),
      );
    };

    void loadSidebarData();
  }, [profile?.societies, user]);

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
    const nextYear =
      profile?.role === "student"
        ? calculateAcademicYear(parsedStartYear)
        : (profile?.year_of_study ?? null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        course,
        campus,
        academic_group: academicGroup || null,
        interests: selectedInterests,
        preferred_event_categories: preferredEventCategories,
        preferred_society_categories: preferredSocietyCategories,
        start_year: parsedStartYear,
        year_of_study: nextYear,
        avatar_url: avatarUrl || null,
        bio: bio.trim() || null,
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
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          My Account
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Account</h1>
          <p className="mt-2 text-[#64615C]">
            View and update your profile details, societies, registered events,
            and profile picture.
          </p>
        </div>
      </div>

      {!isConfigured && (
        <div className="rounded-xl border border-[#F3DFC4] bg-[#FBF3DB] p-6 text-[#956400] ">
          Supabase auth is not configured yet. Add your Supabase environment
          variables to enable login and account features.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 ">
          {loading ? (
            <p className="text-[#64615C]">Loading your account...</p>
          ) : !user ? (
            <p className="text-[#64615C]">You are not logged in.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={avatarUrl || profile?.avatar_url || null}
                    alt={profile?.full_name ?? user.email ?? "Profile picture"}
                    size="lg"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#787774]">
                      Profile picture
                    </p>
                    <p className="text-[#111111]">
                      Set an image URL or leave blank to use the default
                      picture.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-xl bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333333]"
                >
                  Sign out
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-[#787774]">Email</p>
                  <p className="text-[#111111]">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#787774]">
                    Full name
                  </p>
                  <p className="text-[#111111]">
                    {profile?.full_name ?? "Not set"}
                  </p>
                  {profile?.bio && (
                    <p className="mt-1 text-sm text-[#64615C]">{profile.bio}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#787774]">Role</p>
                  <p className="text-[#111111]">{profile?.role ?? "student"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#787774]">
                    Effective year of study
                  </p>
                  <p className="text-[#111111]">{effectiveYear ?? "Not set"}</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label
                    htmlFor="account-avatar-url"
                    className="mb-2 block text-sm font-medium text-[#4A4844]"
                  >
                    Profile picture URL
                  </label>
                  <input
                    id="account-avatar-url"
                    type="url"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="account-course"
                      className="mb-2 block text-sm font-medium text-[#4A4844]"
                    >
                      Course
                    </label>
                    <select
                      id="account-course"
                      value={course}
                      onChange={(event) => setCourse(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                    >
                      {courseOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="account-campus"
                      className="mb-2 block text-sm font-medium text-[#4A4844]"
                    >
                      Campus
                    </label>
                    <select
                      id="account-campus"
                      value={campus}
                      onChange={(event) => setCampus(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                    >
                      {campusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="account-group"
                      className="mb-2 block text-sm font-medium text-[#4A4844]"
                    >
                      Group
                    </label>
                    <select
                      id="account-group"
                      value={academicGroup}
                      onChange={(event) => setAcademicGroup(event.target.value)}
                      className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                    >
                      <option value="">Select group</option>
                      {academicGroupOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="account-start-year"
                    className="mb-2 block text-sm font-medium text-[#4A4844]"
                  >
                    Academic start year
                  </label>
                  <input
                    id="account-start-year"
                    type="number"
                    min="2010"
                    max="2100"
                    value={startYear}
                    onChange={(event) => setStartYear(event.target.value)}
                    className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="account-bio"
                    className="mb-2 block text-sm font-medium text-[#4A4844]"
                  >
                    Bio
                  </label>
                  <textarea
                    id="account-bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value.slice(0, 300))}
                    rows={4}
                    maxLength={300}
                    className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
                    placeholder="Tell people a bit about yourself..."
                  />
                  <p className="mt-2 text-xs text-[#787774]">{bio.length}/300 characters</p>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-[#4A4844]">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((option) => {
                      const active = selectedInterests.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelectedInterests(
                              toggleValue(selectedInterests, option),
                            )
                          }
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-[#1F6C9F] text-white" : "border border-[#D8D6D0] bg-white text-[#4A4844] hover:bg-[#FBFBFA]"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-[#4A4844]">
                    Preferred event categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {eventCategoryOptions.map((option) => {
                      const active = preferredEventCategories.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setPreferredEventCategories(
                              toggleValue(preferredEventCategories, option),
                            )
                          }
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-[#111111] text-white" : "border border-[#D8D6D0] bg-white text-[#4A4844] hover:bg-[#FBFBFA]"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-[#4A4844]">
                    Preferred society categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((option) => {
                      const active =
                        preferredSocietyCategories.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setPreferredSocietyCategories(
                              toggleValue(preferredSocietyCategories, option),
                            )
                          }
                          className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-[#346538] text-white" : "border border-[#D8D6D0] bg-white text-[#4A4844] hover:bg-[#FBFBFA]"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#111111] px-5 py-3 text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>

              {message && (
                <div className="rounded-xl border border-[#D5E5D1] bg-[#EDF3EC] p-4 text-sm text-[#346538]">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-4 text-sm text-[#9F2F2D]">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 ">
            <h2 className="text-xl font-semibold text-[#111111]">
              My societies
            </h2>
            <p className="mt-2 text-sm text-[#64615C]">
              The societies you joined across the platform.
            </p>
            <div className="mt-4 space-y-3">
              {joinedSocieties.length > 0 ? (
                joinedSocieties.map((society) => (
                  <article
                    key={society.id}
                    className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
                        {society.category}
                      </span>
                      {society.meeting_day && (
                        <span className="rounded-full bg-[#EAEAEA] px-3 py-1 text-sm font-medium text-[#4A4844]">
                          {society.meeting_day}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[#111111]">
                      {society.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#64615C]">
                      {society.description}
                    </p>
                    <p className="mt-3 text-sm text-[#787774]">
                      Contact: {society.contact_email ?? "Not listed"}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#D8D6D0] p-4 text-sm text-[#64615C]">
                  You haven&apos;t joined any societies yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 ">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#111111]">
                  Registered events
                </h2>
                <p className="mt-1 text-sm text-[#1F6C9F]">
                  How not to miss your events
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIcsHelp((current) => !current)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-lg border border-[#CFE6F4] bg-[#E1F3FE] text-base font-semibold text-[#1F6C9F] transition hover:border-[#A9D2E8] hover:bg-[#E1F3FE] sm:h-10 sm:w-10"
                aria-label="How to add events to your calendar"
              >
                ?
              </button>
            </div>

            {showIcsHelp && (
              <div className="mt-4 rounded-xl border border-[#CFE6F4] bg-[#E1F3FE] p-4 text-sm text-[#164E73]">
                <p className="font-semibold">
                  How to add an event to your calendar
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    Click <strong>Download ICS</strong> on any registered event.
                  </li>
                  <li>
                    Open the downloaded file from your browser or downloads
                    folder.
                  </li>
                  <li>
                    Choose Microsoft Outlook / Calendar when prompted, or import
                    it manually into your calendar app.
                  </li>
                  <li>Confirm the event save so you get reminders later.</li>
                </ol>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4"
                  >
                    <p className="font-medium text-[#111111]">{event.title}</p>
                    <p className="mt-1 text-sm text-[#64615C]">
                      {event.event_date} • {event.start_time} - {event.end_time}
                    </p>
                    <p className="mt-1 text-sm text-[#64615C]">
                      {event.location}
                      {event.campus ? ` • ${event.campus}` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => downloadEventIcs(event)}
                      className="mt-3 rounded-xl border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
                    >
                      Download ICS
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#D8D6D0] p-4 text-sm text-[#64615C]">
                  No registered events yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
