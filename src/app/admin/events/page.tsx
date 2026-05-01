"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminSearch } from "@/components/admin/admin-search";
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
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) =>
      [
        event.title,
        event.category,
        event.location,
        event.description,
        event.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [events, search]);

  if (!profile || profile.role !== "admin") {
    return (
      <section className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-6 text-[#9F2F2D] ">
        Admin access only.
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
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(true);
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
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select()
        .single();
      if (error || !data) {
        setMessage(error?.message ?? "Failed to create event.");
        return;
      }
      eventId = data.id;
    }

    if (eventId) {
      await supabase.from("event_tags").delete().eq("event_id", eventId);
      const tagList = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        await supabase
          .from("event_tags")
          .insert(tagList.map((tag) => ({ event_id: eventId, tag })));
      }
    }

    setMessage(
      editingId ? "Event updated successfully." : "Event created successfully.",
    );
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
    setMessage(null);
    setIsModalOpen(true);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Manage Events</h1>
          <p className="mt-2 text-[#64615C]">
            View, edit, and delete events with live event tags.
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

      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search events by title, category, location, description, or tags"
      />

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="rounded-xl border border-[#EAEAEA] bg-white p-5 "
          >
            <h2 className="text-xl font-semibold text-[#111111]">
              {event.title}
            </h2>
            <p className="mt-2 text-sm text-[#787774]">
              {event.event_date} • {event.start_time}
            </p>
            <p className="mt-1 text-sm text-[#787774]">{event.location}</p>
            <p className="mt-3 text-[#64615C]">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#E1F3FE] px-3 py-1 text-xs font-medium text-[#1F6C9F]"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleEdit(event)}
                className="rounded-xl border border-[#D8D6D0] px-4 py-2 text-sm font-medium text-[#111111]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(event.id)}
                className="rounded-xl bg-[#9F2F2D] px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {isModalOpen && (
        <AdminModal
          title={editingId ? "Edit Event" : "Add Event"}
          description="Fill in the details below and save the event."
          onClose={resetForm}
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((current) => ({ ...current, title: e.target.value }))
              }
              placeholder="Event title"
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              value={form.category}
              onChange={(e) =>
                setForm((current) => ({ ...current, category: e.target.value }))
              }
              placeholder="Category"
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              value={form.location}
              onChange={(e) =>
                setForm((current) => ({ ...current, location: e.target.value }))
              }
              placeholder="Location"
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  eventDate: e.target.value,
                }))
              }
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  startTime: e.target.value,
                }))
              }
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm((current) => ({ ...current, endTime: e.target.value }))
              }
              className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              required
            />
            <input
              value={form.tags}
              onChange={(e) =>
                setForm((current) => ({ ...current, tags: e.target.value }))
              }
              placeholder="Tags comma separated"
              className="rounded-xl border border-[#D8D6D0] px-4 py-3 md:col-span-2"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
              className="rounded-xl border border-[#D8D6D0] px-4 py-3 md:col-span-2"
              rows={5}
              required
            />
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-[#111111] px-5 py-3 text-white"
              >
                {editingId ? "Update event" : "Create event"}
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
        </AdminModal>
      )}
    </section>
  );
}
