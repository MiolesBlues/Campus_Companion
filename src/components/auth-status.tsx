"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

export function AuthStatus() {
  const { loading, user, profile, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-[#F3DFC4] bg-[#FBF3DB] px-4 py-2 text-sm text-[#956400]">
        Supabase auth not configured yet
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[#EAEAEA] bg-white px-4 py-2 text-sm text-[#787774]">
        Checking account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#F7F6F3]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333333]"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {profile?.role === "admin" && (
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg border border-[#CFE6F4] bg-[#E1F3FE] px-4 py-2 text-sm font-medium text-[#1F6C9F] transition hover:border-[#A9D2E8]"
          title="Settings"
          aria-label="Settings"
        >
          <span className="text-sm" aria-hidden="true">
            Admin
          </span>
          <span>Settings</span>
        </Link>
      )}

      <Link
        href="/account"
        className="flex items-center gap-3 rounded-lg border border-[#D8D6D0] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#F7F6F3]"
      >
        <Avatar
          src={profile?.avatar_url ?? null}
          alt={profile?.full_name ?? user.email ?? "User avatar"}
          size="sm"
        />
        <span>{profile?.full_name ?? user.email}</span>
      </Link>
    </div>
  );
}
