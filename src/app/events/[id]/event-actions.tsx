"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserEventRegistrations } from "@/lib/data";
import { downloadEventIcs } from "@/lib/ics";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventWithTags } from "@/types/database";

export function EventActions({ event }: { event: EventWithTags }) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadRegistration = async () => {
      if (!user) {
        setIsRegistered(false);
        return;
      }
      const data = await getUserEventRegistrations(user.id);
      setIsRegistered(data.some((item) => item.event_id === event.id));
    };

    void loadRegistration();
  }, [user, event.id]);

  const toggleRegister = async () => {
    if (!user) {
      setMessage("Please log in to register for events.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    if (isRegistered) {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", event.id);
      setIsRegistered(false);
      setMessage(`Unregistered from ${event.title}.`);
    } else {
      await supabase
        .from("event_registrations")
        .insert({ user_id: user.id, event_id: event.id });
      setIsRegistered(true);
      setMessage(`Registered for ${event.title}.`);
    }
  };

  return (
    <aside className="rounded-xl border border-[#E2E0DA] bg-[#FBFBFA] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#787774]">
        Event actions
      </p>
      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={() => void toggleRegister()}
          className={`min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition ${isRegistered ? "border border-[#D8D6D0] bg-white text-[#111111] hover:bg-[#FBFBFA]" : "bg-[#111111] text-white hover:bg-[#333333]"}`}
        >
          {isRegistered ? "Unregister" : "Register"}
        </button>
        <button
          type="button"
          onClick={() => downloadEventIcs(event)}
          className="min-h-11 rounded-xl border border-[#D8D6D0] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#A9D2E8] hover:bg-white"
        >
          Download ICS
        </button>
      </div>
      {message && (
        <p className="mt-3 rounded-lg border border-[#CFE6F4] bg-[#E1F3FE] px-3 py-2 text-sm text-[#164E73]">
          {message}
        </p>
      )}
    </aside>
  );
}
