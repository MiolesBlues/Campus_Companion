import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { AuthProvider } from "@/components/auth-provider";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { AuthStatus } from "@/components/auth-status";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <AccessibilityProvider>
            <AuthGate>
              <a
                href="#main-content"
                className="skip-link absolute left-4 top-4 -translate-y-20 rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition focus:translate-y-0"
              >
                Skip to content
              </a>

              <header className="border-b border-[#EAEAEA] bg-[#FBFBFA]/95 backdrop-blur">
                <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Link
                      href="/"
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 transition duration-200 hover:bg-[#F7F6F3] active:scale-[0.99] lg:w-auto"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#111111]">
                        <span className="text-sm font-semibold tracking-wide text-white">
                          CC
                        </span>
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="text-[15px] font-semibold tracking-tight text-[#111111]">
                          Campus Companion
                        </p>
                        <p className="text-[11px] text-[#787774]">
                          Student life made simpler
                        </p>
                      </div>
                    </Link>

                    <AuthStatus />
                  </div>

                  <MainNav />
                </nav>
              </header>

              <main
                id="main-content"
                className="mx-auto min-h-[100dvh] max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10"
              >
                {children}
              </main>
            </AuthGate>
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
