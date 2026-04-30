"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

export function AuthStatus() {
  const { loading, user, profile, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 shadow-sm">
        Supabase auth not configured yet
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm">
        Checking account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
        Guest
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {profile?.role === "admin" && (
        <Link
          href="/admin"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-base text-slate-900 transition hover:bg-slate-50"
          title="Settings"
          aria-label="Settings"
        >
          ⚙️
        </Link>
      )}

      <Link
        href="/account"
        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
      >
        <Avatar src={profile?.avatar_url ?? null} alt={profile?.full_name ?? user.email ?? "User avatar"} size="sm" />
        <span>{profile?.full_name ?? user.email}</span>
      </Link>
    </div>
  );
}
