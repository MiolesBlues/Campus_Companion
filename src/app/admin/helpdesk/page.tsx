"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getHelpdeskTickets, getProfilesList } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { HelpdeskTicketRecord, Profile } from "@/types/database";

const statusOptions: HelpdeskTicketRecord["status"][] = ["open", "in_progress", "resolved", "closed"];

export default function AdminHelpdeskPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<HelpdeskTicketRecord[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadTickets = async () => {
    const data = await getHelpdeskTickets();
    setTickets(data);
  };

  const loadProfiles = async () => {
    const data = await getProfilesList();
    setProfiles(data);
  };

  useEffect(() => {
    void Promise.all([loadTickets(), loadProfiles()]);
  }, []);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;
    return tickets.filter((ticket) =>
      [
        ticket.subject,
        ticket.category,
        ticket.urgency,
        ticket.status,
        ticket.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, tickets]);

  if (!profile || profile.role !== "admin") {
    return (
      <section className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-6 text-[#9F2F2D] ">
        Admin access only.
      </section>
    );
  }

  const handleDelete = async (id: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("helpdesk_tickets")
      .delete()
      .eq("id", id);
    setMessage(
      error ? error.message : "Helpdesk request deleted successfully.",
    );
    if (!error) {
      await loadTickets();
    }
  };

  const handleUpdate = async (
    id: number,
    updates: Partial<Pick<HelpdeskTicketRecord, "status" | "assigned_to" | "admin_notes">>,
  ) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const payload = {
      ...updates,
      assigned_to: updates.assigned_to || null,
      admin_notes: updates.admin_notes?.trim() || null,
    };
    const { error } = await supabase
      .from("helpdesk_tickets")
      .update(payload)
      .eq("id", id);
    setMessage(error ? error.message : "Helpdesk request updated successfully.");
    if (!error) {
      await loadTickets();
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111111]">Helpdesk Requests</h1>
        <p className="mt-2 text-[#64615C]">
          Review, assign, update, and delete support requests.
        </p>
      </div>

      <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 ">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search requests by subject, category, urgency, status, or description"
          className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
        />
      </div>

      {message && (
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-sm text-[#64615C] ">
          {message}
        </div>
      )}

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="rounded-xl border border-[#EAEAEA] bg-white p-5 "
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[#111111]">
                    {ticket.subject}
                  </h2>
                  <p className="text-sm text-[#787774]">
                    {ticket.category} • {ticket.urgency} • {ticket.status}
                  </p>
                  <p className="text-[#64615C]">{ticket.description}</p>
                  <p className="text-sm text-[#787774]">
                    Created: {ticket.created_at}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(ticket.id)}
                  className="rounded-xl bg-[#9F2F2D] px-4 py-2 text-sm font-medium text-white"
                >
                  Delete
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <select
                  defaultValue={ticket.status}
                  onChange={(event) =>
                    void handleUpdate(ticket.id, {
                      status: event.target.value as HelpdeskTicketRecord["status"],
                    })
                  }
                  className="rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue={ticket.assigned_to ?? ""}
                  onChange={(event) =>
                    void handleUpdate(ticket.id, {
                      assigned_to: event.target.value || null,
                    })
                  }
                  className="rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
                >
                  <option value="">Unassigned</option>
                  {profiles
                    .filter(
                      (userProfile) =>
                        userProfile.role === "admin" || userProfile.role === "teacher",
                    )
                    .map((userProfile) => (
                      <option key={userProfile.id} value={userProfile.id}>
                        {userProfile.full_name}
                      </option>
                    ))}
                </select>

                <input
                  defaultValue={ticket.admin_notes ?? ""}
                  onBlur={(event) =>
                    void handleUpdate(ticket.id, {
                      admin_notes: event.target.value,
                    })
                  }
                  placeholder="Admin notes"
                  className="rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
