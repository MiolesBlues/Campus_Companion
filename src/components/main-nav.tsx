"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/timetables", label: "Timetables" },
  { href: "/societies", label: "Societies" },
  { href: "/locations", label: "Locations" },
  { href: "/helpdesk", label: "Helpdesk" },
  { href: "/account", label: "Account" },
];

export function MainNav() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 shadow-sm">Loading navigation...</div>;
  }

  return (
    <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="min-w-[120px] flex-1 rounded-xl px-4 py-3 text-center text-base font-medium text-slate-700 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
