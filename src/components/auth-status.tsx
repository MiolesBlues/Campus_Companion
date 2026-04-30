"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

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
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/account"
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
      >
        {profile?.full_name ?? user.email}
        {profile?.role === "admin" ? " (Admin)" : ""}
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
