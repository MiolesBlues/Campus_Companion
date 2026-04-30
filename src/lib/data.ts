import { getSupabaseClient } from "@/lib/supabase/client";
import fallbackEvents from "@/data/events.json";
import fallbackLocations from "@/data/locations.json";
import fallbackTimetables from "@/data/timetables.json";
import type { EventRecord, TimetableRecord } from "@/types/database";

type LocationRecord = {
  id: number;
  name: string;
  type: string;
  description: string;
  opening_hours: string | null;
  accessibility_notes: string | null;
};

type FallbackEvent = {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
};

type FallbackLocation = {
  id: number;
  name: string;
  type: string;
  description: string;
  opening_hours: string;
  accessibility_notes: string;
};

type FallbackTimetable = {
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

const eventFallback = fallbackEvents as FallbackEvent[];
const locationFallback = fallbackLocations as FallbackLocation[];
const timetableFallback = fallbackTimetables as FallbackTimetable[];

export async function getEvents() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return eventFallback.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      description: event.description,
      location: event.location,
      event_date: event.date,
      start_time: event.time,
      end_time: event.time,
      audience: "all",
      capacity: null,
      published: true,
    })) as EventRecord[];
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    console.error("Failed to load events", error);
    return eventFallback.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      description: event.description,
      location: event.location,
      event_date: event.date,
      start_time: event.time,
      end_time: event.time,
      audience: "all",
      capacity: null,
      published: true,
    })) as EventRecord[];
  }

  return data as EventRecord[];
}

export async function getLocations() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return locationFallback as LocationRecord[];
  }

  const { data, error } = await supabase
    .from("locations")
    .select("id, name, type, description, opening_hours, accessibility_notes")
    .eq("published", true)
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Failed to load locations", error);
    return locationFallback as LocationRecord[];
  }

  return data as LocationRecord[];
}

export async function getTimetables() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return timetableFallback.map((entry) => ({
      id: entry.id,
      course_code: entry.course === "Teaching" ? "STAFF" : entry.course.slice(0, 3).toUpperCase(),
      course_name: entry.course,
      year_of_study: entry.year.startsWith("Year ") ? Number(entry.year.replace("Year ", "")) : null,
      semester: 1,
      day_of_week: entry.day,
      module_code: `MOD-${entry.id}`,
      module_name: entry.module,
      lecturer_name: entry.lecturer,
      lecturer_email: entry.lecturerEmail ?? null,
      room: entry.location,
      building: entry.location,
      start_time: entry.time.split(" - ")[0],
      end_time: entry.time.split(" - ")[1] ?? entry.time.split(" - ")[0],
      delivery_mode: "In Person",
      owner_role: entry.role ?? "student",
      published: true,
    })) as TimetableRecord[];
  }

  const { data, error } = await supabase
    .from("timetables")
    .select("*")
    .eq("published", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    console.error("Failed to load timetables", error);
    return timetableFallback.map((entry) => ({
      id: entry.id,
      course_code: entry.course === "Teaching" ? "STAFF" : entry.course.slice(0, 3).toUpperCase(),
      course_name: entry.course,
      year_of_study: entry.year.startsWith("Year ") ? Number(entry.year.replace("Year ", "")) : null,
      semester: 1,
      day_of_week: entry.day,
      module_code: `MOD-${entry.id}`,
      module_name: entry.module,
      lecturer_name: entry.lecturer,
      lecturer_email: entry.lecturerEmail ?? null,
      room: entry.location,
      building: entry.location,
      start_time: entry.time.split(" - ")[0],
      end_time: entry.time.split(" - ")[1] ?? entry.time.split(" - ")[0],
      delivery_mode: "In Person",
      owner_role: entry.role ?? "student",
      published: true,
    })) as TimetableRecord[];
  }

  return data as TimetableRecord[];
}
