"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getTimetables } from "@/lib/data";
import { getEffectiveYearOfStudy } from "@/lib/profile";
import type { TimetableRecord } from "@/types/database";

const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const defaultTimeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const dayColors: Record<string, string> = {
  Monday: "bg-blue-100",
  Tuesday: "bg-lime-100",
  Wednesday: "bg-yellow-100",
  Thursday: "bg-rose-100",
  Friday: "bg-violet-100",
};
const subjectColors = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-yellow-100 border-yellow-300", "bg-pink-100 border-pink-300", "bg-purple-100 border-purple-300", "bg-cyan-100 border-cyan-300"];

function subjectColor(moduleCode: string) {
  let sum = 0;
  for (const char of moduleCode) sum += char.charCodeAt(0);
  return subjectColors[sum % subjectColors.length];
}

export default function TimetablesPage() {
  const { profile, user } = useAuth();
  const [entries, setEntries] = useState<TimetableRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const effectiveYear = getEffectiveYearOfStudy(profile);

  useEffect(() => {
    const loadTimetables = async () => {
      const data = await getTimetables();
      setEntries(data);
    };

    void loadTimetables();
  }, []);

  const studentEntries = useMemo(() => entries.filter((entry) => entry.owner_role === "student"), [entries]);
  const courses = useMemo(() => ["All", ...new Set(studentEntries.map((entry) => entry.course_name))], [studentEntries]);
  const years = useMemo(() => ["All", ...new Set(studentEntries.map((entry) => `Year ${entry.year_of_study}`))], [studentEntries]);

  useEffect(() => {
    if (profile?.role === "student") {
      if (profile.course) setSelectedCourse(profile.course);
      if (effectiveYear) setSelectedYear(`Year ${effectiveYear}`);
    }
  }, [effectiveYear, profile]);

  const filteredEntries = useMemo(() => {
    const teacherEntries = entries
      .filter((entry) => entry.owner_role === "teacher")
      .filter((entry) => !user?.email || entry.lecturer_email === user.email);

    if (profile?.role === "teacher") {
      return teacherEntries.sort((a, b) => daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time));
    }

    let filtered = studentEntries
      .filter((entry) => (selectedCourse === "All" ? true : entry.course_name === selectedCourse))
      .filter((entry) => (selectedYear === "All" ? true : `Year ${entry.year_of_study}` === selectedYear));

    if (filtered.length === 0 && profile?.role === "student") {
      filtered = studentEntries;
    }

    return filtered.sort((a, b) => daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time));
  }, [entries, profile?.role, selectedCourse, selectedYear, studentEntries, user?.email]);

  const timeSlots = useMemo(() => {
    const slotSet = new Set(defaultTimeSlots);
    filteredEntries.forEach((entry) => slotSet.add(entry.start_time));
    return Array.from(slotSet).sort();
  }, [filteredEntries]);

  const cellMap = useMemo(() => {
    const map = new Map<string, TimetableRecord[]>();
    filteredEntries.forEach((entry) => {
      const key = `${entry.day_of_week}-${entry.start_time}`;
      const current = map.get(key) ?? [];
      current.push(entry);
      map.set(key, current);
    });
    return map;
  }, [filteredEntries]);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Weekly Planner</span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{profile?.role === "teacher" ? "Teacher Timetable" : "Student Timetable"}</h1>
          <p className="mt-2 text-slate-600">{profile?.role === "teacher" ? "Your teaching schedule is shown automatically based on your account email." : "A colorful weekly timetable view with your own schedule selected automatically when available."}</p>
        </div>
      </div>

      {profile?.role !== "teacher" && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <label htmlFor="course-filter" className="mb-2 block text-sm font-medium text-slate-700">Filter by course</label>
            <select id="course-filter" value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
              {courses.map((course) => (<option key={course} value={course}>{course}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="year-filter" className="mb-2 block text-sm font-medium text-slate-700">Filter by year</label>
            <select id="year-filter" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none">
              {years.map((year) => (<option key={year} value={year}>{year}</option>))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700">Time / period</th>
                {daysOrder.map((day) => (
                  <th key={day} className={`border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 ${dayColors[day]}`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">{time}</td>
                  {daysOrder.map((day) => {
                    const cellEntries = cellMap.get(`${day}-${time}`) ?? [];
                    return (
                      <td key={`${day}-${time}`} className="min-w-[220px] border border-slate-300 px-2 py-2 align-top">
                        <div className="flex min-h-28 flex-col gap-2">
                          {cellEntries.map((entry) => (
                            <div key={entry.id} className={`rounded-xl border p-3 text-sm shadow-sm ${subjectColor(entry.module_code)}`}>
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold text-slate-900">{entry.module_name}</p>
                                <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-slate-700">{entry.course_name}{entry.year_of_study ? ` · Y${entry.year_of_study}` : ""}</span>
                              </div>
                              <p className="mt-1 text-slate-700">{entry.start_time} - {entry.end_time}</p>
                              <p className="mt-1 text-slate-700">{entry.building}, {entry.room}</p>
                              <p className="mt-1 text-slate-700">{entry.lecturer_name}</p>
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

      {filteredEntries.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">No timetable entries found for this account or filter.</div>}
    </section>
  );
}
