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

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const semesterOptions = ["1", "2"];
const deliveryModeOptions = ["In Person", "Online", "Hybrid"];
const ownerRoleOptions = ["student", "teacher"];
const yearOptions = ["1", "2", "3", "4", "5", "6"];
const teacherCourseCode = "STAFF";
const teacherCourseName = "Teacher Timetable";

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
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured for this deployment.");
      return;
    }

    const normalizedOwnerRole = profile.role === "teacher" ? "teacher" : form.owner_role;
    const normalizedCourseCode = normalizedOwnerRole === "teacher" ? teacherCourseCode : form.course_code.trim().toUpperCase();
    const normalizedCourseName = normalizedOwnerRole === "teacher" ? teacherCourseName : form.course_name.trim();
    const normalizedYearOfStudy = normalizedOwnerRole === "teacher" ? null : Number(form.year_of_study);
    const normalizedSemester = Number(form.semester);
    const normalizedStartTime = form.start_time.trim();
    const normalizedEndTime = form.end_time.trim();

    if (!normalizedCourseCode || !normalizedCourseName || !form.module_code.trim() || !form.module_name.trim() || !form.lecturer_name.trim() || !form.room.trim() || !form.building.trim()) {
      setMessage("Please fill in all required timetable fields.");
      return;
    }

    if (!semesterOptions.includes(form.semester)) {
      setMessage("Semester must be 1 or 2.");
      return;
    }

    if (!dayOptions.includes(form.day_of_week)) {
      setMessage("Please choose a valid weekday.");
      return;
    }

    if (!deliveryModeOptions.includes(form.delivery_mode)) {
      setMessage("Please choose a valid delivery mode.");
      return;
    }

    if (normalizedOwnerRole === "student" && !yearOptions.includes(form.year_of_study)) {
      setMessage("Year of study must be between 1 and 6 for student timetables.");
      return;
    }

    if (normalizedStartTime >= normalizedEndTime) {
      setMessage("End time must be later than start time.");
      return;
    }

    const payload = {
      ...form,
      course_code: normalizedCourseCode,
      course_name: normalizedCourseName,
      module_code: form.module_code.trim().toUpperCase(),
      module_name: form.module_name.trim(),
      lecturer_name: form.lecturer_name.trim(),
      lecturer_email: profile.role === "teacher" ? user?.email ?? form.lecturer_email.trim() : form.lecturer_email.trim() || null,
      room: form.room.trim(),
      building: form.building.trim(),
      year_of_study: normalizedYearOfStudy,
      semester: normalizedSemester,
      start_time: normalizedStartTime,
      end_time: normalizedEndTime,
      owner_role: normalizedOwnerRole,
      published: true,
    };

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
      start_time: entry.start_time.slice(0, 5),
      end_time: entry.end_time.slice(0, 5),
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
            <form noValidate className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <input
                value={form.course_code}
                onChange={(e) =>
                  setForm((current) => ({ ...current, course_code: e.target.value }))
                }
                placeholder="Course code"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
                disabled={profile.role === "teacher" || form.owner_role === "teacher"}
              />
              <input
                value={form.course_name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, course_name: e.target.value }))
                }
                placeholder="Course name"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
                disabled={profile.role === "teacher" || form.owner_role === "teacher"}
              />
              <select
                value={form.owner_role}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    owner_role: e.target.value,
                    course_code:
                      e.target.value === "teacher" ? teacherCourseCode : current.course_code,
                    course_name:
                      e.target.value === "teacher" ? teacherCourseName : current.course_name,
                    year_of_study: e.target.value === "teacher" ? "1" : current.year_of_study,
                  }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                disabled={profile.role === "teacher"}
              >
                {ownerRoleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "teacher" ? "Teacher timetable" : "Student timetable"}
                  </option>
                ))}
              </select>
              <select
                value={form.year_of_study}
                onChange={(e) =>
                  setForm((current) => ({ ...current, year_of_study: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required={form.owner_role !== "teacher"}
                disabled={form.owner_role === "teacher"}
              >
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    Year {option}
                  </option>
                ))}
              </select>
              <select
                value={form.semester}
                onChange={(e) =>
                  setForm((current) => ({ ...current, semester: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              >
                {semesterOptions.map((option) => (
                  <option key={option} value={option}>
                    Semester {option}
                  </option>
                ))}
              </select>
              <select
                value={form.day_of_week}
                onChange={(e) =>
                  setForm((current) => ({ ...current, day_of_week: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              >
                {dayOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={form.module_code}
                onChange={(e) =>
                  setForm((current) => ({ ...current, module_code: e.target.value }))
                }
                placeholder="Module code"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                value={form.module_name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, module_name: e.target.value }))
                }
                placeholder="Module name"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                value={form.lecturer_name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, lecturer_name: e.target.value }))
                }
                placeholder="Lecturer name"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                type="email"
                value={form.lecturer_email}
                onChange={(e) =>
                  setForm((current) => ({ ...current, lecturer_email: e.target.value }))
                }
                placeholder="Lecturer email"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                disabled={profile.role === "teacher"}
              />
              <input
                value={form.room}
                onChange={(e) =>
                  setForm((current) => ({ ...current, room: e.target.value }))
                }
                placeholder="Room"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                value={form.building}
                onChange={(e) =>
                  setForm((current) => ({ ...current, building: e.target.value }))
                }
                placeholder="Building"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm((current) => ({ ...current, start_time: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm((current) => ({ ...current, end_time: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <select
                value={form.delivery_mode}
                onChange={(e) =>
                  setForm((current) => ({ ...current, delivery_mode: e.target.value }))
                }
                className="rounded-xl border border-[#D8D6D0] px-4 py-3 md:col-span-2"
                required
              >
                {deliveryModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#111111] px-5 py-3 text-white"
                >
                  {editingId ? "Update timetable entry" : "Create timetable entry"}
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
