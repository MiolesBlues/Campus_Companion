"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function AdminDashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <section className="text-[#64615C]">Loading admin dashboard...</section>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <section className="rounded-xl border border-[#F4C8CA] bg-[#FDEBEC] p-6 text-[#9F2F2D] ">
        Admin access only.
      </section>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Control Centre
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[#64615C] sm:text-base">
            Manage platform content, user roles, events, timetables, societies,
            locations, and support requests.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/events"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">
            Manage Events
          </h2>
          <p className="mt-2 text-[#64615C]">
            Create, review, and update event records.
          </p>
        </Link>
        <Link
          href="/admin/timetables"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">
            Manage Timetables
          </h2>
          <p className="mt-2 text-[#64615C]">
            Update student and teacher timetables.
          </p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">Manage Users</h2>
          <p className="mt-2 text-[#64615C]">
            Review profiles and assign student, teacher, or admin roles.
          </p>
        </Link>
        <Link
          href="/admin/societies"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">
            Manage Societies
          </h2>
          <p className="mt-2 text-[#64615C]">
            Create, edit, and delete societies.
          </p>
        </Link>
        <Link
          href="/admin/locations"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">
            Manage Locations
          </h2>
          <p className="mt-2 text-[#64615C]">
            Create, edit, and delete campus locations.
          </p>
        </Link>
        <Link
          href="/admin/helpdesk"
          className="rounded-xl border border-[#EAEAEA] bg-white p-6 transition hover:-translate-y-1 hover:border-[#D8D6D0]"
        >
          <h2 className="text-xl font-semibold text-[#111111]">
            Helpdesk Requests
          </h2>
          <p className="mt-2 text-[#64615C]">
            Read and delete support requests.
          </p>
        </Link>
      </div>
    </section>
  );
}
