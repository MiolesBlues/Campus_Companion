"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents, getSocietiesList } from "@/lib/data";
import type { EventWithTags, Society } from "@/types/database";

function eventRecommendationScore(
  event: EventWithTags,
  campus: string | null | undefined,
  interests: string[] | null | undefined,
  preferredCategories: string[] | null | undefined,
) {
  let score = 0;
  if (campus && event.campus === campus) score += 3;
  if (preferredCategories?.includes(event.category)) score += 3;
  if (interests?.includes(event.category)) score += 2;
  return score;
}

function societyRecommendationScore(
  society: Society,
  interests: string[] | null | undefined,
  preferredSocietyCategories: string[] | null | undefined,
) {
  let score = 0;
  if (preferredSocietyCategories?.includes(society.category)) score += 3;
  if (interests?.includes(society.category)) score += 2;
  return score;
}

export default function Home() {
  const { profile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithTags[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventWithTags[]>(
    [],
  );
  const [recommendedSocieties, setRecommendedSocieties] = useState<Society[]>(
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      const [events, societies] = await Promise.all([
        getEvents(),
        getSocietiesList(),
      ]);
      setUpcomingEvents(events.slice(0, 3));

      const rankedEvents = [...events]
        .sort(
          (a, b) =>
            eventRecommendationScore(
              b,
              profile?.campus,
              profile?.interests,
              profile?.preferred_event_categories,
            ) -
            eventRecommendationScore(
              a,
              profile?.campus,
              profile?.interests,
              profile?.preferred_event_categories,
            ),
        )
        .filter(
          (event) =>
            eventRecommendationScore(
              event,
              profile?.campus,
              profile?.interests,
              profile?.preferred_event_categories,
            ) > 0,
        )
        .slice(0, 3);
      setRecommendedEvents(rankedEvents);

      const rankedSocieties = [...societies]
        .sort(
          (a, b) =>
            societyRecommendationScore(
              b,
              profile?.interests,
              profile?.preferred_society_categories,
            ) -
            societyRecommendationScore(
              a,
              profile?.interests,
              profile?.preferred_society_categories,
            ),
        )
        .filter(
          (society) =>
            societyRecommendationScore(
              society,
              profile?.interests,
              profile?.preferred_society_categories,
            ) > 0,
        )
        .slice(0, 3);
      setRecommendedSocieties(rankedSocieties);
    };

    void loadData();
  }, [
    profile?.campus,
    profile?.interests,
    profile?.preferred_event_categories,
    profile?.preferred_society_categories,
  ]);

  const hasRecommendations = useMemo(
    () => recommendedEvents.length > 0 || recommendedSocieties.length > 0,
    [recommendedEvents.length, recommendedSocieties.length],
  );

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-xl border border-[#EAEAEA] bg-white p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Student Life Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-bold text-[#111111] sm:text-4xl">
          Campus Companion
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#64615C] sm:text-lg">
          Your closed campus platform for events, timetables, societies,
          support, and day-to-day student life.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/account"
            className="rounded-xl bg-[#111111] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#333333]"
          >
            Open my account
          </Link>
          <Link
            href="/events"
            className="rounded-xl border border-[#D8D6D0] bg-white px-5 py-3 text-center text-sm font-medium text-[#111111] transition hover:border-[#C8C5BE] hover:bg-[#FBFBFA]"
          >
            Browse events
          </Link>
          <Link
            href="/timetables"
            className="rounded-xl border border-[#D8D6D0] bg-white px-5 py-3 text-center text-sm font-medium text-[#111111] transition hover:border-[#C8C5BE] hover:bg-[#FBFBFA]"
          >
            Check timetable
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/events"
          className="rounded-xl border border-[#EAEAEA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D8D6D0] focus:outline-none focus:ring-2 focus:ring-[#A9D2E8] sm:p-6"
        >
          <h2 className="text-xl font-semibold text-[#111111]">Events</h2>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Register for upcoming campus talks, fairs, and student activities.
          </p>
          <p className="mt-4 text-sm font-medium text-[#1F6C9F]">
            Open events →
          </p>
        </Link>
        <Link
          href="/timetables"
          className="rounded-xl border border-[#EAEAEA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D8D6D0] focus:outline-none focus:ring-2 focus:ring-[#A9D2E8] sm:p-6"
        >
          <h2 className="text-xl font-semibold text-[#111111]">Timetables</h2>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Use a list for broad browsing or a compact grid for your exact
            course, year, and group.
          </p>
          <p className="mt-4 text-sm font-medium text-[#1F6C9F]">
            Open timetables →
          </p>
        </Link>
        <Link
          href="/societies"
          className="rounded-xl border border-[#EAEAEA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D8D6D0] focus:outline-none focus:ring-2 focus:ring-[#A9D2E8] sm:p-6"
        >
          <h2 className="text-xl font-semibold text-[#111111]">Societies</h2>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Find student communities, filter by category, and join what fits
            you.
          </p>
          <p className="mt-4 text-sm font-medium text-[#1F6C9F]">
            Open societies →
          </p>
        </Link>
        <Link
          href="/helpdesk"
          className="rounded-xl border border-[#EAEAEA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#D8D6D0] focus:outline-none focus:ring-2 focus:ring-[#A9D2E8] sm:p-6"
        >
          <h2 className="text-xl font-semibold text-[#111111]">Helpdesk</h2>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Send support requests quickly when something on campus goes
            sideways.
          </p>
          <p className="mt-4 text-sm font-medium text-[#1F6C9F]">
            Open helpdesk →
          </p>
        </Link>
      </div>

      {hasRecommendations && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#111111] sm:text-2xl">
                Recommended for you
              </h2>
              <p className="mt-1 text-sm text-[#64615C]">
                Based on your campus, interests, and preferences.
              </p>
            </div>
            <Link
              href="/account"
              className="text-sm font-medium text-[#1F6C9F] hover:text-[#164E73]"
            >
              Update preferences
            </Link>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-[#111111]">Events</h3>
              <div className="mt-3 space-y-3">
                {recommendedEvents.length > 0 ? (
                  recommendedEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#E1F3FE] px-3 py-1 text-xs font-medium text-[#1F6C9F]">
                          {event.category}
                        </span>
                        <span className="rounded-full bg-[#EAEAEA] px-3 py-1 text-xs font-medium text-[#4A4844]">
                          Recommended
                        </span>
                      </div>
                      <h4 className="mt-3 font-semibold text-[#111111]">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-sm text-[#64615C]">
                        {event.event_date} • {event.location}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#D8D6D0] p-4 text-sm text-[#64615C]">
                    No event recommendations yet.
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111111]">
                Societies
              </h3>
              <div className="mt-3 space-y-3">
                {recommendedSocieties.length > 0 ? (
                  recommendedSocieties.map((society) => (
                    <article
                      key={society.id}
                      className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#EDF3EC] px-3 py-1 text-xs font-medium text-[#346538]">
                          {society.category}
                        </span>
                        <span className="rounded-full bg-[#EAEAEA] px-3 py-1 text-xs font-medium text-[#4A4844]">
                          Suggested
                        </span>
                      </div>
                      <h4 className="mt-3 font-semibold text-[#111111]">
                        {society.name}
                      </h4>
                      <p className="mt-2 text-sm text-[#64615C]">
                        {society.description}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#D8D6D0] p-4 text-sm text-[#64615C]">
                    No society recommendations yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111111] sm:text-2xl">
              Upcoming events
            </h2>
            <p className="mt-1 text-sm text-[#64615C]">
              A quick look at the next 3 things happening on campus.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-[#1F6C9F] hover:text-[#164E73]"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4 sm:p-5"
              >
                <p className="text-sm font-medium text-[#787774]">
                  {event.event_date} • {event.start_time}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#111111]">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-[#64615C]">
                  {event.location}
                  {event.campus ? ` • ${event.campus}` : ""}
                </p>
                <p className="mt-3 text-sm text-[#64615C] sm:text-base">
                  {event.description}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-[#FBFBFA] p-5 text-sm text-[#64615C] md:col-span-2">
              No upcoming events are published yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
