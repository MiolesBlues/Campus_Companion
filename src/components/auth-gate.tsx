"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const publicPaths = new Set(["/login", "/signup"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, user, isConfigured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = pathname ? publicPaths.has(pathname) : false;

  useEffect(() => {
    if (!isConfigured || loading || user || isPublicPath) {
      return;
    }

    router.replace("/login");
  }, [isConfigured, isPublicPath, loading, router, user]);

  if (!isConfigured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-[#EAEAEA] bg-white px-6 py-5 text-sm text-[#64615C] ">
          Checking access...
        </div>
      </main>
    );
  }

  if (!user && !isPublicPath) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-[#EAEAEA] bg-white px-6 py-5 text-sm text-[#64615C] ">
          Redirecting to login...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
