"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,

} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClubLogo } from "../ClubBranding";

type Role = "student" | "faculty" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
          selectedRole: role,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      router.push(response.data.user.role === "faculty" ? "/faculty" : response.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(
        message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ek-login min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            <Link href="/" className="flex items-center gap-3">
              <ClubLogo className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />

              <div>
                <p className="text-xl font-extrabold text-white">
                  AICC Club
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Artificial Intelligence and Coding Club
                </p>
              </div>
            </Link>

            <div className="max-w-lg">
              

              <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
                Learn.
                <span className="block text-indigo-400">
                  Build.
                </span>
                Connect.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Discover events, Learn coding, participate in technical events,
                collaborate on projects and build skills with AICC.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Discover upcoming campus events",
                  "Participate in technical Events",
                  "Build practical AI and coding skills",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4" />
              Build by AICC Technical Team
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md ek-reveal">

            {/* Mobile Logo */}
            <Link
              href="/"
              className="mb-10 flex items-center gap-3 lg:hidden"
            >
              <ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />

              <span className="text-lg font-extrabold">
                AICC Club
              </span>
            </Link>

            <div className="mb-8">
              <p className="text-sm font-bold text-indigo-600">
                Welcome back 👋
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Sign in as {role}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Access your events, registrations, attendance and
                attendance.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm ek-reveal ek-delay-1">
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Sign in as</p>
              <div className="grid grid-cols-3 gap-1">
                {(["student", "faculty", "admin"] as Role[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setRole(item); setError(""); }}
                    className={`rounded-xl px-2 py-2.5 text-xs font-bold capitalize transition ${role === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900">
              <p className="font-bold">Demo {role} access</p>
              <p className="mt-1 font-mono text-xs text-indigo-700">
                {role === "student" ? "test@student.com / 123456" : role === "faculty" ? "faculty@aicc.com / Faculty@123" : "admin@aicc.com / Admin@123"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {role === "student" ? "Email address" : `${role[0].toUpperCase()}${role.slice(1)} email`}
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <span className="text-xs font-semibold text-slate-400">Need help? Contact your campus administrator.</span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}

                {!loading && (
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                Create one
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-slate-400">
              By continuing, you agree to use AICC Club responsibly
              for campus activities.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
