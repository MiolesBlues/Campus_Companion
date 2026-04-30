"use client";

import { useAuth } from "@/components/auth-provider";

export default function AccountPage() {
  const { loading, user, profile, isConfigured } = useAuth();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          My Account
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">
            View your account information and role-based access level.
          </p>
        </div>
      </div>

      {!isConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          Supabase auth is not configured yet. Add your Supabase environment variables to enable login and account features.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading your account...</p>
        ) : !user ? (
          <p className="text-slate-600">You are not logged in.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Full name</p>
              <p className="text-slate-900">{profile?.full_name ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Role</p>
              <p className="text-slate-900">{profile?.role ?? "user"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Course</p>
              <p className="text-slate-900">{profile?.course ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Year of study</p>
              <p className="text-slate-900">{profile?.year_of_study ?? "Not set"}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
