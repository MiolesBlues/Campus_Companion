"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getTimetables } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { TimetableRecord } from "@/types/database";

const initialForm = {
  course_code: "CS",
  course_name: "Computer Science",
  year_of_study: "1",
  semester: "1",
  day_of_week: "Monday",
  module_code: "",
  module_name: "",
  lecturer_name: "",
  lecturer_email: "",
  room: "",
  building: "",
  start_time: "09:00",
  end_time: "10:00",
  delivery_mode: "In Person",
  owner_role: "student",
};

export default function AdminTimetablesPage() {
  const { profile, user } = useAuth();
  const [entries, setEntries] = useState<TimetableRecord[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTimetables = async () => {
    const data = await getTimetables();
    setEntries(data);
  };

  useEffect(() => {
    void loadTimetables();
  }, []);

  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Teacher or admin access only.</section>;
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const canManageEntry = (entry: TimetableRecord) => {
    if (profile.role === "admin") {
      return true;
    }

    return profile.role === "teacher" && entry.lecturer_email === user?.email;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const payload = {
      ...form,
      year_of_study: form.owner_role === "teacher" ? null : Number(form.year_of_study),
      semester: Number(form.semester),
      published: true,
    };

    if (profile.role === "teacher") {
      payload.lecturer_email = user?.email ?? form.lecturer_email;
    }

    const response = editingId
      ? await supabase.from("timetables").update(payload).eq("id", editingId)
      : await supabase.from("timetables").insert(payload);

    setMessage(response.error ? response.error.message : editingId ? "Timetable entry updated." : "Timetable entry created.");
    if (!response.error) {
      resetForm();
      await loadTimetables();
    }
  };

  const handleEdit = (entry: TimetableRecord) => {
    if (!canManageEntry(entry)) {
      return;
    }

    setEditingId(entry.id);
    setForm({
      course_code: entry.course_code,
      course_name: entry.course_name,
      year_of_study: String(entry.year_of_study ?? 1),
      semester: String(entry.semester),
      day_of_week: entry.day_of_week,
      module_code: entry.module_code,
      module_name: entry.module_name,
      lecturer_name: entry.lecturer_name,
      lecturer_email: entry.lecturer_email ?? "",
      room: entry.room,
      building: entry.building,
      start_time: entry.start_time,
      end_time: entry.end_time,
      delivery_mode: entry.delivery_mode,
      owner_role: entry.owner_role,
    });
  };

  const handleDelete = async (id: number, entry: TimetableRecord) => {
    if (!canManageEntry(entry)) {
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from("timetables").delete().eq("id", id);
    setMessage(error ? error.message : "Timetable entry deleted.");
    if (!error) {
      await loadTimetables();
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Timetables</h1>
        <p className="mt-2 text-slate-600">Add, edit, and delete student or teacher timetable entries.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              value={value}
              onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
              placeholder={key.replaceAll("_", " ")}
              className="rounded-xl border border-slate-300 px-4 py-3"
              required={!['lecturer_email'].includes(key)}
              disabled={profile.role === "teacher" && ["owner_role", "lecturer_email"].includes(key)}
            />
          ))}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-white">
              {editingId ? "Update timetable entry" : "Create timetable entry"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-5 py-3 text-slate-900">
                Cancel edit
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Day</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Module</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Course</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Lecturer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.day_of_week}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.module_name}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.course_name}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.lecturer_name}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(entry)} disabled={!canManageEntry(entry)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Edit</button>
                      <button type="button" onClick={() => void handleDelete(entry.id, entry)} disabled={!canManageEntry(entry)} className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
