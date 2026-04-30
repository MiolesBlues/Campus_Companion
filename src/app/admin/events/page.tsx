"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

export default function AdminEventsPage() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  if (!profile || profile.role !== "admin") {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Admin access only.</section>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        category,
        location,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        description,
        audience: "all",
        published: true,
      })
      .select()
      .single();

    if (error || !data) {
      setMessage(error?.message ?? "Failed to create event.");
      return;
    }

    const tagList = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (tagList.length > 0) {
      await supabase.from("event_tags").insert(tagList.map((tag) => ({ event_id: data.id, tag })));
    }

    setMessage("Event created successfully.");
    setTitle("");
    setCategory("");
    setLocation("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setTags("");
    await loadEvents();
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Events</h1>
        <p className="mt-2 text-slate-600">Create events and view live event/tag data.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags comma separated" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" rows={4} required />
          <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-white md:col-span-2">Create event</button>
        </form>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{event.event_date} • {event.start_time}</p>
            <p className="mt-2 text-slate-600">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">#{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
