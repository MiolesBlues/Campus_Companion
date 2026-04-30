"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getLocations } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { LocationRecord } from "@/types/database";

const initialForm = {
  name: "",
  type: "",
  description: "",
  opening_hours: "",
  accessibility_notes: "",
  contact_email: "",
  contact_phone: "",
};

export default function AdminLocationsPage() {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadLocations = async () => {
    const data = await getLocations();
    setLocations(data);
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  if (!profile || profile.role !== "admin") {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Admin access only.</section>;
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

    const payload = { ...form, published: true };
    const response = editingId
      ? await supabase.from("locations").update(payload).eq("id", editingId)
      : await supabase.from("locations").insert(payload);

    setMessage(response.error ? response.error.message : editingId ? "Location updated successfully." : "Location created successfully.");
    if (!response.error) {
      resetForm();
      await loadLocations();
    }
  };

  const handleEdit = (location: LocationRecord) => {
    setEditingId(location.id);
    setForm({
      name: location.name,
      type: location.type,
      description: location.description,
      opening_hours: location.opening_hours ?? "",
      accessibility_notes: location.accessibility_notes ?? "",
      contact_email: location.contact_email ?? "",
      contact_phone: location.contact_phone ?? "",
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("locations").delete().eq("id", id);
    setMessage(error ? error.message : "Location deleted successfully.");
    if (!error) {
      await loadLocations();
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Locations</h1>
          <p className="mt-2 text-slate-600">View, create, edit, and delete campus locations.</p>
        </div>
        <button type="button" onClick={openCreateModal} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-sm transition hover:bg-slate-700">+</button>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">{message}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {locations.map((location) => (
          <article key={location.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{location.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{location.type}</p>
            <p className="mt-3 text-slate-600">{location.description}</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => handleEdit(location)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900">Edit</button>
              <button type="button" onClick={() => void handleDelete(location.id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
            </div>
          </article>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit Location" : "Add Location"}</h2>
                <p className="mt-1 text-sm text-slate-600">Fill in the details below and save the location.</p>
              </div>
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Close</button>
            </div>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Location name" className="rounded-xl border border-slate-300 px-4 py-3" required />
              <input value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))} placeholder="Type" className="rounded-xl border border-slate-300 px-4 py-3" required />
              <input value={form.opening_hours} onChange={(e) => setForm((current) => ({ ...current, opening_hours: e.target.value }))} placeholder="Opening hours" className="rounded-xl border border-slate-300 px-4 py-3" />
              <input value={form.accessibility_notes} onChange={(e) => setForm((current) => ({ ...current, accessibility_notes: e.target.value }))} placeholder="Accessibility notes" className="rounded-xl border border-slate-300 px-4 py-3" />
              <input value={form.contact_email} onChange={(e) => setForm((current) => ({ ...current, contact_email: e.target.value }))} placeholder="Contact email" className="rounded-xl border border-slate-300 px-4 py-3" />
              <input value={form.contact_phone} onChange={(e) => setForm((current) => ({ ...current, contact_phone: e.target.value }))} placeholder="Contact phone" className="rounded-xl border border-slate-300 px-4 py-3" />
              <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" rows={5} required />
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-white">{editingId ? "Update location" : "Create location"}</button>
                <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-5 py-3 text-slate-900">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
