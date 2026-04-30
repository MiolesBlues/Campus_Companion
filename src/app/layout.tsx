import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/components/auth-provider";
import { AuthStatus } from "@/components/auth-status";
import { MainNav } from "@/components/main-nav";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <a
            href="#main-content"
            className="skip-link absolute left-4 top-4 -translate-y-20 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white focus:translate-y-0"
          >
            Skip to content
          </a>

          <header className="border-b border-slate-200/80 bg-white">
            <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Link
                  href="/"
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-100 lg:w-auto"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-900 shadow-sm sm:h-11 sm:w-11">
                    <span className="text-sm font-semibold tracking-wide text-white">CC</span>
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Campus Companion</p>
                    <p className="text-[11px] text-slate-500 sm:text-xs">Student life made simpler</p>
                  </div>
                </Link>

                <AuthStatus />
              </div>

              <MainNav />
            </nav>
          </header>

          <main id="main-content" className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
