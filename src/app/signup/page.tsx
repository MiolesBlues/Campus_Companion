import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Join Campus Companion
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Create account</h1>
          <p className="mt-2 text-[#64615C]">
            Sign up as a student. Teacher and admin roles can only be granted by
            admins.
          </p>
        </div>
      </div>

      <AuthForm mode="signup" />

      <p className="text-sm text-[#64615C]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#1F6C9F] hover:text-[#164E73]"
        >
          Log in here
        </Link>
        .
      </p>
    </section>
  );
}
