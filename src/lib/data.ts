import { getSupabaseClient } from "@/lib/supabase/client";
import { fallbackSocieties } from "@/lib/societies";
import fallbackEvents from "@/data/events.json";
import fallbackLocations from "@/data/locations.json";
import fallbackTimetables from "@/data/timetables.json";
import type {
  EventRecord,
  EventRegistrationRecord,
  EventTagRecord,
  EventWithTags,
  HelpdeskTicketRecord,
  LocationRecord,
  Profile,
  Society,
  SocietyJoinRecord,
  TimetableRecord,
} from "@/types/database";

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

const eventFallback = fallbackEvents as unknown as FallbackEvent[];
const locationFallback = fallbackLocations as FallbackLocation[];
const timetableFallback = fallbackTimetables as FallbackTimetable[];

function mapFallbackEvents(): EventWithTags[] {
  const today = new Date().toISOString().slice(0, 10);
  return eventFallback
    .map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      description: event.description,
      location: event.location,
      campus: "Main Campus",
      event_date: event.date,
      start_time: event.time,
      end_time: event.time,
      audience: "all",
      capacity: null,
      published: true,
      tags: event.tags,
    }))
    .filter((event) => event.event_date >= today);
}

export async function getEvents() {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  if (!supabase) {
    return mapFallbackEvents();
  }

  const [{ data: events, error: eventsError }, { data: tags, error: tagsError }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.from("event_tags").select("*"),
  ]);

  if (eventsError || !events || tagsError || !tags) {
    console.error("Failed to load events or tags", { eventsError, tagsError });
    return mapFallbackEvents();
  }

  const tagsByEvent = new Map<number, string[]>();
  (tags as EventTagRecord[]).forEach((tag) => {
    const current = tagsByEvent.get(tag.event_id) ?? [];
    current.push(tag.tag);
    tagsByEvent.set(tag.event_id, current);
  });

  return (events as EventRecord[]).map((event) => ({
    ...event,
    tags: tagsByEvent.get(event.id) ?? [],
  }));
}

export async function getLocations() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return locationFallback.map((location) => ({ ...location, campus: "Main Campus" })) as LocationRecord[];
  }

  const { data, error } = await supabase
    .from("locations")
    .select("id, name, type, description, campus, opening_hours, accessibility_notes, contact_email, contact_phone, published")
    .eq("published", true)
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Failed to load locations", error);
    return locationFallback.map((location) => ({ ...location, campus: "Main Campus" })) as LocationRecord[];
  }

  return data as LocationRecord[];
}

function mapFallbackTimetables(): TimetableRecord[] {
  return timetableFallback.map((entry) => {
    const [startTime, endTime] = entry.time.split(" - ");
    return {
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
      start_time: startTime,
      end_time: endTime ?? startTime,
      delivery_mode: "In Person",
      owner_role: entry.role ?? "student",
      published: true,
    };
  });
}

export async function getTimetables() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return mapFallbackTimetables();
  }

  const { data, error } = await supabase
    .from("timetables")
    .select("*")
    .eq("published", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    console.error("Failed to load timetables", error);
    return mapFallbackTimetables();
  }

  return data as TimetableRecord[];
}

export async function getSocietiesList() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackSocieties;
  }

  const { data, error } = await supabase
    .from("societies")
    .select("*")
    .eq("published", true)
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Failed to load societies list", error);
    return fallbackSocieties;
  }

  return data as Society[];
}

export async function getProfilesList() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, course, campus, year_of_study, start_year, avatar_url, societies, created_at, updated_at, bio")
    .order("full_name", { ascending: true });

  if (error || !data) {
    console.error("Failed to load profiles list", error);
    return [];
  }

  return data as Profile[];
}

export async function getHelpdeskTickets() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("helpdesk_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load helpdesk tickets", error);
    return [];
  }

  return data as HelpdeskTicketRecord[];
}

export async function getUserSocietyMemberships(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("society_memberships")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Failed to load society memberships", error);
    return [];
  }

  return data as SocietyJoinRecord[];
}

export async function getUserEventRegistrations(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Failed to load event registrations", error);
    return [];
  }

  return data as EventRegistrationRecord[];
}
