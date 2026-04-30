"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function AdminDashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <section className="text-slate-600">Loading admin dashboard...</section>;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
        Admin access only.
      </section>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Control Centre</span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Manage platform content, user roles, events, and timetables.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/events" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">Manage Events</h2>
          <p className="mt-2 text-slate-600">Create, review, and update event records.</p>
        </Link>
        <Link href="/admin/timetables" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">Manage Timetables</h2>
          <p className="mt-2 text-slate-600">Update student and teacher timetables.</p>
        </Link>
        <Link href="/admin/users" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">Manage Users</h2>
          <p className="mt-2 text-slate-600">Review profiles and assign student, teacher, or admin roles.</p>
        </Link>
      </div>
    </section>
  );
}
