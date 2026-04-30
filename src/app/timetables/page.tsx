"use client";

import { useMemo, useState } from "react";
import timetables from "@/data/timetables.json";

type TimetableEntry = {
  id: number;
  course: string;
  year: string;
  day: string;
  module: string;
  time: string;
  location: string;
  lecturer: string;
};

const entries = timetables as TimetableEntry[];
const courses = ["All", ...new Set(entries.map((entry) => entry.course))];
const years = ["All", ...new Set(entries.map((entry) => entry.year))];
const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablesPage() {
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) =>
        selectedCourse === "All" ? true : entry.course === selectedCourse
      )
      .filter((entry) => (selectedYear === "All" ? true : entry.year === selectedYear))
      .sort((a, b) => {
        const dayDifference = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDifference !== 0) {
          return dayDifference;
        }

        return a.time.localeCompare(b.time);
      });
  }, [selectedCourse, selectedYear]);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Weekly Planner
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Timetables</h1>
          <p className="mt-2 text-slate-600">
            Check class schedules by course and academic year, with sample timetable data for quick browsing.
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <label
            htmlFor="course-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
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
          <label
            htmlFor="year-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
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
                <tr
                  key={entry.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
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
          No timetable entries found for the selected course and year.
        </div>
      )}
    </section>
  );
}
