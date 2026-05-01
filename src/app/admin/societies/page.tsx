"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSocietiesList } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Society } from "@/types/database";

const initialForm = {
  name: "",
  category: "",
  description: "",
  contact_email: "",
  meeting_day: "",
};

export default function AdminSocietiesPage() {
  const { profile } = useAuth();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSocieties = async () => {
    const data = await getSocietiesList();
    setSocieties(data);
  };

  useEffect(() => {
    void loadSocieties();
  }, []);

  const filteredSocieties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return societies;
    return societies.filter((society) =>
      [
        society.name,
        society.category,
        society.description,
        society.contact_email ?? "",
        society.meeting_day ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, societies]);

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
    const payload = { ...form, published: true };
    const response = editingId
      ? await supabase.from("societies").update(payload).eq("id", editingId)
      : await supabase.from("societies").insert(payload);
    setMessage(
      response.error
        ? response.error.message
        : editingId
          ? "Society updated successfully."
          : "Society created successfully.",
    );
    if (!response.error) {
      resetForm();
      await loadSocieties();
    }
  };

  const handleEdit = (society: Society) => {
    setEditingId(society.id);
    setForm({
      name: society.name,
      category: society.category,
      description: society.description,
      contact_email: society.contact_email ?? "",
      meeting_day: society.meeting_day ?? "",
    });
    setMessage(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("societies").delete().eq("id", id);
    setMessage(error ? error.message : "Society deleted successfully.");
    if (!error) {
      await loadSocieties();
      if (editingId === id) resetForm();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">
            Manage Societies
          </h1>
          <p className="mt-2 text-[#64615C]">
            View, create, edit, and delete societies.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-xl font-semibold text-white transition hover:bg-[#333333]"
        >
          +
        </button>
      </div>
      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 ">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search societies by name, category, description, contact, or meeting day"
          className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
        />
      </div>
      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {filteredSocieties.map((society) => (
          <article
            key={society.id}
            className="rounded-xl border border-[#EAEAEA] bg-white p-5 "
          >
            <h2 className="text-xl font-semibold text-[#111111]">
              {society.name}
            </h2>
            <p className="mt-2 text-sm text-[#787774]">{society.category}</p>
            <p className="mt-3 text-[#64615C]">{society.description}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => handleEdit(society)}
                className="rounded-xl border border-[#D8D6D0] px-4 py-2 text-sm font-medium text-[#111111]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(society.id)}
                className="rounded-xl bg-[#9F2F2D] px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[#EAEAEA] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(17,17,17,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111111]">
                  {editingId ? "Edit Society" : "Add Society"}
                </h2>
                <p className="mt-1 text-sm text-[#64615C]">
                  Fill in the details below and save the society.
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
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="Society name"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    category: e.target.value,
                  }))
                }
                placeholder="Category"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
                required
              />
              <input
                value={form.contact_email}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    contact_email: e.target.value,
                  }))
                }
                placeholder="Contact email"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
              />
              <input
                value={form.meeting_day}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    meeting_day: e.target.value,
                  }))
                }
                placeholder="Meeting day"
                className="rounded-xl border border-[#D8D6D0] px-4 py-3"
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
                  {editingId ? "Update society" : "Create society"}
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
