"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/timetables", label: "Timetables" },
  { href: "/societies", label: "Societies" },
  { href: "/locations", label: "Locations" },
  { href: "/helpdesk", label: "Helpdesk" },
];

export function MainNav() {
  const { profile, user, loading } = useAuth();

  const navLinks = [...publicNavLinks];

  if (!loading && !user) {
    navLinks.push({ href: "/login", label: "Log in" });
    navLinks.push({ href: "/signup", label: "Sign up" });
  }

  if (user) {
    navLinks.push({ href: "/account", label: "Account" });
  }

  if (profile?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:grid-cols-4 xl:grid-cols-8">
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
