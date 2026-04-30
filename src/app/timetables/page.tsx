"use client";

import { useEffect, useMemo, useState } from "react";
import timetables from "@/data/timetables.json";
import { useAuth } from "@/components/auth-provider";
import { getEffectiveYearOfStudy } from "@/lib/profile";

type TimetableEntry = {
  id: number;
  course: string;
  year: string;
  day: string;
  module: string;
  time: string;
  location: string;
  lecturer: string;
  role?: "student" | "teacher";
  lecturerEmail?: string;
};

const entries = timetables as TimetableEntry[];
const courses = ["All", ...new Set(entries.filter((entry) => (entry.role ?? "student") === "student").map((entry) => entry.course))];
const years = ["All", ...new Set(entries.filter((entry) => (entry.role ?? "student") === "student").map((entry) => entry.year))];
const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablesPage() {
  const { profile, user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const effectiveYear = getEffectiveYearOfStudy(profile);

  useEffect(() => {
    if (profile?.role === "student") {
      if (profile.course) {
        setSelectedCourse(profile.course);
      }
      if (effectiveYear) {
        setSelectedYear(`Year ${effectiveYear}`);
      }
    }
  }, [effectiveYear, profile]);

  const filteredEntries = useMemo(() => {
    if (profile?.role === "teacher") {
      return entries
        .filter((entry) => (entry.role ?? "student") === "teacher")
        .filter((entry) => !user?.email || entry.lecturerEmail === user.email)
        .sort((a, b) => {
          const dayDifference = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
          if (dayDifference !== 0) {
            return dayDifference;
          }

          return a.time.localeCompare(b.time);
        });
    }

    return entries
      .filter((entry) => (entry.role ?? "student") === "student")
      .filter((entry) => (selectedCourse === "All" ? true : entry.course === selectedCourse))
      .filter((entry) => (selectedYear === "All" ? true : entry.year === selectedYear))
      .sort((a, b) => {
        const dayDifference = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDifference !== 0) {
          return dayDifference;
        }

        return a.time.localeCompare(b.time);
      });
  }, [profile?.role, selectedCourse, selectedYear, user?.email]);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Weekly Planner
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {profile?.role === "teacher" ? "Teacher Timetable" : "Student Timetables"}
          </h1>
          <p className="mt-2 text-slate-600">
            {profile?.role === "teacher"
              ? "Your teaching schedule is shown automatically based on your account email."
              : "Check class schedules by course and academic year, with your own timetable selected automatically when available."}
          </p>
        </div>
      </div>

      {profile?.role !== "teacher" && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <label htmlFor="course-filter" className="mb-2 block text-sm font-medium text-slate-700">
              Filter by course
            </label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year-filter" className="mb-2 block text-sm font-medium text-slate-700">
              Filter by year
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Day</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Module</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Course</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Lecturer</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.day}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.time}</td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{entry.module}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.course}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.year}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.location}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.lecturer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
          No timetable entries found for this account or filter.
        </div>
      )}
    </section>
  );
}
