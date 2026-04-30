"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/timetables", label: "Timetables" },
  { href: "/societies", label: "Societies" },
  { href: "/locations", label: "Locations" },
  { href: "/helpdesk", label: "Helpdesk" },
  { href: "/account", label: "Account" },
];

export function MainNav() {
  const { profile } = useAuth();

  const navLinks =
    profile?.role === "admin"
      ? [...baseNavLinks, { href: "/admin", label: "Admin" }]
      : baseNavLinks;

  return (
    <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:grid-cols-4 xl:flex xl:items-center xl:gap-2 xl:p-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-xl px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 sm:px-4"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
