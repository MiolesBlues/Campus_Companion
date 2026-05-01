import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Join Campus Companion
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-slate-600">
            Sign up as a student. Teacher and admin roles can only be granted by admins.
          </p>
        </div>
      </div>

      <AuthForm mode="signup" />

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:text-blue-900">
          Log in here
        </Link>
        .
      </p>
    </section>
  );
}
