import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Companion",
  description: "A web app to help students navigate campus life.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/locations", label: "Locations" },
  { href: "/helpdesk", label: "Helpdesk" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="skip-link absolute left-4 top-4 -translate-y-20 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white focus:translate-y-0"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
                C
              </div>
              <div className="leading-tight">
                <p className="text-base font-semibold text-slate-900">
                  Campus Companion
                </p>
                <p className="text-xs text-slate-500">
                  Student life made simpler
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main
          id="main-content"
          className="mx-auto min-h-screen max-w-6xl px-6 py-10"
        >
          {children}
        </main>
      </body>
    </html>
  );
}