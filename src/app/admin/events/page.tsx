"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getEvents } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

const initialForm = {
  title: "",
  category: "",
  location: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  description: "",
  tags: "",
};

export default function AdminEventsPage() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventWithTags[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const payload = {
      title: form.title,
      category: form.category,
      location: form.location,
      event_date: form.eventDate,
      start_time: form.startTime,
      end_time: form.endTime,
      description: form.description,
      audience: "all",
      published: true,
    };

    let eventId = editingId;

    if (editingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingId);
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      if (error || !data) {
        setMessage(error?.message ?? "Failed to create event.");
        return;
      }
      eventId = data.id;
    }

    if (eventId) {
      await supabase.from("event_tags").delete().eq("event_id", eventId);
      const tagList = form.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
      if (tagList.length > 0) {
        await supabase.from("event_tags").insert(tagList.map((tag) => ({ event_id: eventId, tag })));
      }
    }

    setMessage(editingId ? "Event updated successfully." : "Event created successfully.");
    resetForm();
    await loadEvents();
  };

  const handleEdit = (eventItem: EventWithTags) => {
    setEditingId(eventItem.id);
    setForm({
      title: eventItem.title,
      category: eventItem.category,
      location: eventItem.location,
      eventDate: eventItem.event_date,
      startTime: eventItem.start_time,
      endTime: eventItem.end_time,
      description: eventItem.description,
      tags: eventItem.tags.join(", "),
    });
  };

  const handleDelete = async (eventId: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.from("event_tags").delete().eq("event_id", eventId);
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    setMessage(error ? error.message : "Event deleted successfully.");
    await loadEvents();
    if (editingId === eventId) {
      resetForm();
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Events</h1>
        <p className="mt-2 text-slate-600">Create, edit, and delete events with live event tags.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Event title" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} placeholder="Category" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} placeholder="Location" className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="date" value={form.eventDate} onChange={(e) => setForm((current) => ({ ...current, eventDate: e.target.value }))} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="time" value={form.startTime} onChange={(e) => setForm((current) => ({ ...current, startTime: e.target.value }))} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input type="time" value={form.endTime} onChange={(e) => setForm((current) => ({ ...current, endTime: e.target.value }))} className="rounded-xl border border-slate-300 px-4 py-3" required />
          <input value={form.tags} onChange={(e) => setForm((current) => ({ ...current, tags: e.target.value }))} placeholder="Tags comma separated" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
          <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" rows={4} required />
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-white">
              {editingId ? "Update event" : "Create event"}
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
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => handleEdit(event)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900">Edit</button>
              <button type="button" onClick={() => void handleDelete(event.id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
