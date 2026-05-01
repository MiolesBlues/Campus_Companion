import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Welcome Back
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Log in</h1>
          <p className="mt-2 text-slate-600">
            Access your student account to manage helpdesk requests and view your personalised experience.
          </p>
        </div>
      </div>

      <AuthForm mode="login" />

      <p className="text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-blue-700 hover:text-blue-900">
          Create one here
        </Link>
        .
      </p>
    </section>
  );
}
