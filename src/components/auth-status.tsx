"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

export function AuthStatus() {
  const { loading, user, profile, signOut, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow-sm">
        Supabase auth not configured yet
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
        Checking account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
        Guest
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
      >
        <Avatar src={profile?.avatar_url ?? null} alt={profile?.full_name ?? user.email ?? "User avatar"} size="sm" />
        <span>
          {profile?.full_name ?? user.email}
          {profile?.role === "admin" ? " (Admin)" : ""}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Sign out
      </button>
    </div>
  );
}
