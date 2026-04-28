import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Companion",
  description: "A web app to help students navigate campus life.",
};

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

        <header className="border-b border-slate-200 bg-white shadow-sm">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-slate-900">
              Campus Companion
            </Link>

            <div className="flex gap-4 text-sm font-medium">
              <Link href="/" className="text-slate-700 hover:text-slate-900">
                Home
              </Link>
              <Link
                href="/events"
                className="text-slate-700 hover:text-slate-900"
              >
                Events
              </Link>
              <Link
                href="/locations"
                className="text-slate-700 hover:text-slate-900"
              >
                Locations
              </Link>
              <Link
                href="/helpdesk"
                className="text-slate-700 hover:text-slate-900"
              >
                Helpdesk
              </Link>
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
