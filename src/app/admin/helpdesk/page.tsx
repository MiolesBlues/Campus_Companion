"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getHelpdeskTickets } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { HelpdeskTicketRecord } from "@/types/database";

export default function AdminHelpdeskPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<HelpdeskTicketRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadTickets = async () => {
    const data = await getHelpdeskTickets();
    setTickets(data);
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  if (!profile || profile.role !== "admin") {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">Admin access only.</section>;
  }

  const handleDelete = async (id: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("helpdesk_tickets").delete().eq("id", id);
    setMessage(error ? error.message : "Helpdesk request deleted successfully.");
    if (!error) {
      await loadTickets();
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Helpdesk Requests</h1>
        <p className="mt-2 text-slate-600">Review and delete support requests.</p>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">{message}</div>}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-900">{ticket.subject}</h2>
                <p className="text-sm text-slate-500">{ticket.category} • {ticket.urgency} • {ticket.status}</p>
                <p className="text-slate-600">{ticket.description}</p>
                <p className="text-sm text-slate-500">Created: {ticket.created_at}</p>
              </div>
              <button type="button" onClick={() => void handleDelete(ticket.id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
