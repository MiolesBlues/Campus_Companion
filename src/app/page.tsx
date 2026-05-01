"use client";

import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Student Life Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Campus Companion</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          Your closed campus platform for events, timetables, societies, support, and day-to-day student life.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/account" className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700">Open my account</Link>
          <Link href="/events" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">Browse events</Link>
          <Link href="/timetables" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">Check timetable</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/events" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Events</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Register for upcoming campus talks, fairs, and student activities.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open events →</p>
        </Link>

        <Link href="/timetables" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Timetables</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Use a list for broad browsing or a compact grid for your exact course, year, and group.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open timetables →</p>
        </Link>

        <Link href="/societies" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Societies</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Find student communities, filter by category, and join what fits you.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open societies →</p>
        </Link>

        <Link href="/helpdesk" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Helpdesk</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">Send support requests quickly when something on campus goes sideways.</p>
          <p className="mt-4 text-sm font-medium text-blue-700">Open helpdesk →</p>
        </Link>
      </div>
    </section>
  );
}
