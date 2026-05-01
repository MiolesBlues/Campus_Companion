"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/timetables", label: "Timetables" },
  { href: "/societies", label: "Societies" },
  { href: "/locations", label: "Locations" },
  { href: "/helpdesk", label: "Helpdesk" },
];

export function MainNav() {
  const { loading } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-500 shadow-sm">Loading navigation...</div>;
  }

  return (
    <div className="flex w-full flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm">
      {navLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`min-w-[105px] flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-300 ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-sm"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
