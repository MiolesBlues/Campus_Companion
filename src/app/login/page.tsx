import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-[#E1F3FE] px-3 py-1 text-sm font-medium text-[#1F6C9F]">
          Welcome Back
        </span>
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Log in</h1>
          <p className="mt-2 text-[#64615C]">
            Access your student account to manage helpdesk requests and view
            your personalised experience.
          </p>
        </div>
      </div>

      <AuthForm mode="login" />

      <p className="text-sm text-[#64615C]">
        Need an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#1F6C9F] hover:text-[#164E73]"
        >
          Create one here
        </Link>
        .
      </p>
    </section>
  );
}
