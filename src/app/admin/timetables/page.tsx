"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTimetables = async () => {
    const data = await getTimetables();
    setEntries(data);
  };

  useEffect(() => {
    void loadTimetables();
  }, []);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;

    return entries.filter((entry) =>
      [
        entry.day_of_week,
        entry.module_name,
        entry.course_name,
        entry.lecturer_name,
        entry.room,
        entry.building,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [entries, search]);

  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return (
      <section className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-6 text-[#9F2F2D] ">
        Teacher or admin access only.
      </section>
    );
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setMessage(null);
    setForm({
      ...initialForm,
      lecturer_email: profile.role === "teacher" ? (user?.email ?? "") : "",
      owner_role: profile.role === "teacher" ? "teacher" : "student",
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const canManageEntry = (entry: TimetableRecord) => {
    if (profile.role === "admin") return true;
    return profile.role === "teacher" && entry.lecturer_email === user?.email;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const payload = {
      ...form,
      year_of_study:
        form.owner_role === "teacher" ? null : Number(form.year_of_study),
      semester: Number(form.semester),
      published: true,
    };

    if (profile.role === "teacher") {
      payload.lecturer_email = user?.email ?? form.lecturer_email;
      payload.owner_role = "teacher";
    }

    const response = editingId
      ? await supabase.from("timetables").update(payload).eq("id", editingId)
      : await supabase.from("timetables").insert(payload);

    setMessage(
      response.error
        ? response.error.message
        : editingId
          ? "Timetable entry updated."
          : "Timetable entry created.",
    );

    if (!response.error) {
      resetForm();
      await loadTimetables();
    }
  };

  const handleEdit = (entry: TimetableRecord) => {
    if (!canManageEntry(entry)) return;
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
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, entry: TimetableRecord) => {
    if (!canManageEntry(entry)) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("timetables").delete().eq("id", id);
    setMessage(error ? error.message : "Timetable entry deleted.");
    if (!error) {
      await loadTimetables();
      if (editingId === id) resetForm();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">
            Manage Timetables
          </h1>
          <p className="mt-2 text-[#64615C]">
            View, edit, and delete student or teacher timetable entries.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-xl font-semibold text-white transition hover:bg-[#333333]"
        >
          +
        </button>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 ">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search timetables by day, module, course, lecturer, or room"
          className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
        />
      </div>

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#EAEAEA] bg-white ">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#F7F6F3]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#4A4844]">
                  Day
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#4A4844]">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#4A4844]">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#4A4844]">
                  Lecturer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#4A4844]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#FBFBFA]"}
                >
                  <td className="px-4 py-4 text-sm text-[#4A4844]">
                    {entry.day_of_week}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#4A4844]">
                    {entry.module_name}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#4A4844]">
                    {entry.course_name}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#4A4844]">
                    {entry.lecturer_name}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#4A4844]">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        disabled={!canManageEntry(entry)}
                        className="rounded-xl border border-[#D8D6D0] px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(entry.id, entry)}
                        disabled={!canManageEntry(entry)}
                        className="rounded-xl bg-[#9F2F2D] px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-[#EAEAEA] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(17,17,17,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111111]">
                  {editingId ? "Edit Timetable Entry" : "Add Timetable Entry"}
                </h2>
                <p className="mt-1 text-sm text-[#64615C]">
                  Fill in the timetable details below and save the entry.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#D8D6D0] px-3 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
              >
                Close
              </button>
            </div>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              {Object.entries(form).map(([key, value]) => (
                <input
                  key={key}
                  value={value}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={key.replaceAll("_", " ")}
                  className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                  required={!["lecturer_email"].includes(key)}
                  disabled={
                    profile.role === "teacher" &&
                    ["owner_role", "lecturer_email"].includes(key)
                  }
                />
              ))}
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#111111] px-5 py-3 text-white"
                >
                  {editingId
                    ? "Update timetable entry"
                    : "Create timetable entry"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#D8D6D0] px-5 py-3 text-[#111111]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
