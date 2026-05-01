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
  { href: "/account", label: "Account" },
  { href: "/settings", label: "Settings" },
];

export function MainNav() {
  const { loading } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  if (loading) {
    return (
      <div className="cc-loading-sheen rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-2.5 text-sm text-[#787774]">
        Loading navigation...
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-1.5 rounded-xl border border-[#EAEAEA] bg-[#F7F6F3] p-1.5 sm:grid-cols-4 lg:grid-cols-8">
      {navLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2.5 text-center text-sm font-medium transition duration-200 focus:outline-none ${active ? "bg-white text-[#111111]" : "text-[#4A4844] hover:bg-white hover:text-[#111111]"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
