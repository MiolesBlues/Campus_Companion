"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getTimetables } from "@/lib/data";
import { getEffectiveYearOfStudy } from "@/lib/profile";
import type { TimetableRecord } from "@/types/database";

const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const defaultTimeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
const dayColors: Record<string, string> = {
  Monday: "bg-[#E1F3FE]",
  Tuesday: "bg-[#EDF3EC]",
  Wednesday: "bg-[#FBF3DB]",
  Thursday: "bg-[#FDEBEC]",
  Friday: "bg-[#F1EDF8]",
};
const subjectColors = [
  "bg-[#E1F3FE] border-[#A9D2E8]",
  "bg-[#EDF3EC] border-[#BBD3B8]",
  "bg-[#FBF3DB] border-[#E7D194]",
  "bg-[#FDEBEC] border-[#F4C8CA]",
  "bg-[#F1EDF8] border-[#D9CEE9]",
  "bg-[#E1F3FE] border-[#A9D2E8]",
];

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function subjectColor(moduleCode: string) {
  let sum = 0;
  for (const char of moduleCode) sum += char.charCodeAt(0);
  return subjectColors[sum % subjectColors.length];
}

function extractGroup(entry: TimetableRecord) {
  const match =
    entry.module_name.match(/\((Group\s+\d+)\)$/i) ??
    entry.module_code.match(/-(G\d+)$/i);
  if (!match) return "";
  const value = match[1];
  return /^g\d+$/i.test(value) ? `Group ${value.slice(1)}` : value;
}

function sortEntries(entries: TimetableRecord[]) {
  return [...entries].sort(
    (a, b) =>
      daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week) ||
      normalizeTime(a.start_time).localeCompare(normalizeTime(b.start_time)),
  );
}

export default function TimetablesPage() {
  const { profile, user } = useAuth();
  const [entries, setEntries] = useState<TimetableRecord[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("fallback");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const effectiveYear = getEffectiveYearOfStudy(profile);
  const isTeacher = profile?.role === "teacher";
  const isStudent = profile?.role === "student";

  useEffect(() => {
    const loadTimetables = async () => {
      const result = await getTimetables();
      setEntries(result.data);
      setDataSource(result.source);
    };

    void loadTimetables();
  }, []);

  const teacherEmail = (profile?.email ?? user?.email ?? "").trim().toLowerCase();

  const studentEntries = useMemo(
    () => entries.filter((entry) => entry.year_of_study !== null),
    [entries],
  );

  const teacherEntries = useMemo(
    () =>
      sortEntries(
        entries.filter(
          (entry) =>
            teacherEmail.length > 0 &&
            (entry.lecturer_email ?? "").trim().toLowerCase() === teacherEmail,
        ),
      ),
    [entries, teacherEmail],
  );

  const courses = useMemo(
    () => [...new Set(studentEntries.map((entry) => entry.course_name))],
    [studentEntries],
  );

  useEffect(() => {
    if (!isStudent) return;

    const nextCourse =
      profile?.course && courses.includes(profile.course)
        ? profile.course
        : (courses[0] ?? "");

    if (nextCourse !== selectedCourse) {
      setSelectedCourse(nextCourse);
    }
  }, [courses, isStudent, profile?.course, selectedCourse]);

  const courseEntries = useMemo(
    () =>
      studentEntries.filter((entry) =>
        selectedCourse ? entry.course_name === selectedCourse : false,
      ),
    [selectedCourse, studentEntries],
  );

  const years = useMemo(
    () => [...new Set(courseEntries.map((entry) => `Year ${entry.year_of_study}`))],
    [courseEntries],
  );

  useEffect(() => {
    if (!isStudent) return;

    const preferredYear = effectiveYear ? `Year ${effectiveYear}` : "";
    const nextYear =
      preferredYear && years.includes(preferredYear)
        ? preferredYear
        : (years[0] ?? "");

    if (nextYear !== selectedYear) {
      setSelectedYear(nextYear);
    }
  }, [effectiveYear, isStudent, selectedYear, years]);

  const yearEntries = useMemo(
    () =>
      courseEntries.filter((entry) => `Year ${entry.year_of_study}` === selectedYear),
    [courseEntries, selectedYear],
  );

  const groups = useMemo(
    () => [...new Set(yearEntries.map((entry) => extractGroup(entry)).filter(Boolean))],
    [yearEntries],
  );

  useEffect(() => {
    if (!isStudent) return;

    const preferredGroup = profile?.academic_group ?? "";
    const nextGroup =
      preferredGroup && groups.includes(preferredGroup)
        ? preferredGroup
        : (groups[0] ?? "");

    if (nextGroup !== selectedGroup) {
      setSelectedGroup(nextGroup);
    }
  }, [groups, isStudent, profile?.academic_group, selectedGroup]);

  const studentEntriesToShow = useMemo(() => {
    if (!selectedCourse || !selectedYear) return [];

    return sortEntries(
      yearEntries.filter((entry) => {
        if (!selectedGroup) return true;
        const group = extractGroup(entry);
        return !group || group === selectedGroup;
      }),
    );
  }, [selectedCourse, selectedGroup, selectedYear, yearEntries]);

  const filteredEntries = isTeacher ? teacherEntries : studentEntriesToShow;

  const timeSlots = useMemo(() => {
    const slotSet = new Set(defaultTimeSlots);
    filteredEntries.forEach((entry) => {
      slotSet.add(normalizeTime(entry.start_time));
    });
    return Array.from(slotSet).sort();
  }, [filteredEntries]);

  const cellMap = useMemo(() => {
    const map = new Map<string, TimetableRecord[]>();
    filteredEntries.forEach((entry) => {
      const key = `${entry.day_of_week}-${normalizeTime(entry.start_time)}`;
      const current = map.get(key) ?? [];
      current.push(entry);
      map.set(key, current);
    });
    return map;
  }, [filteredEntries]);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
            Weekly Planner
          </span>
          <span
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${dataSource === "live" ? "bg-[#EDF3EC] text-[#346538]" : "bg-[#FBF3DB] text-[#956400]"}`}
          >
            {dataSource === "live" ? "Live timetable data" : "Demo timetable data"}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">
            {isTeacher ? "Teacher Timetable" : "Student Timetable"}
          </h1>
          <p className="mt-2 text-[#64615C]">
            {isTeacher
              ? `Your teaching schedule is shown automatically based on your account email${profile?.email ? ` (${profile.email})` : ""}.`
              : "Pick a course, year, and group for a focused timetable."}
          </p>
          {dataSource === "fallback" && (
            <p className="mt-2 text-sm font-medium text-[#956400]">
              You are currently seeing demo timetable data because live timetable rows could not be loaded from Supabase.
            </p>
          )}
        </div>
      </div>

      {!isTeacher && (
        <div className="grid gap-4 rounded-xl border border-[#EAEAEA] bg-white p-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="course-filter"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Course
            </label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="year-filter"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Year
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="group-filter"
              className="mb-2 block text-sm font-medium text-[#4A4844]"
            >
              Group
            </label>
            <select
              id="group-filter"
              value={selectedGroup}
              onChange={(event) => setSelectedGroup(event.target.value)}
              className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            >
              {groups.length === 0 ? (
                <option value="">No groups</option>
              ) : (
                groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#EAEAEA] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-[#D8D6D0] bg-[#F7F6F3] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#4A4844]">
                  Time
                </th>
                {daysOrder.map((day) => (
                  <th
                    key={day}
                    className={`border border-[#D8D6D0] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#111111] ${dayColors[day]}`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border border-[#D8D6D0] bg-[#FBFBFA] px-3 py-3 text-xs font-medium text-[#4A4844]">
                    {time}
                  </td>
                  {daysOrder.map((day) => {
                    const cellEntries = cellMap.get(`${day}-${time}`) ?? [];
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="min-w-[170px] border border-[#D8D6D0] px-1.5 py-1.5 align-top"
                      >
                        <div className="flex min-h-20 flex-col gap-1.5">
                          {cellEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className={`rounded-lg border p-2 text-xs ${subjectColor(entry.module_code)}`}
                            >
                              <p className="font-semibold text-[#111111]">
                                {entry.module_name}
                              </p>
                              <p className="mt-0.5 text-[#4A4844]">
                                {normalizeTime(entry.start_time)} - {" "}
                                {normalizeTime(entry.end_time)}
                              </p>
                              <p className="mt-0.5 text-[#4A4844]">{entry.room}</p>
                              <p className="mt-0.5 text-[#4A4844]">
                                {entry.lecturer_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D8D6D0] bg-white p-8 text-center text-[#64615C]">
          {isTeacher
            ? `No timetable entries found for ${profile?.email ?? user?.email ?? "this teacher account"}. Check that the timetable lecturer email matches exactly.`
            : "No timetable entries found for this course, year, or group."}
        </div>
      )}
    </section>
  );
}
