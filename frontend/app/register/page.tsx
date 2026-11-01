"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ClubLogo } from "../ClubBranding";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", studentId: "", department: "", year: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", { ...form, year: form.year ? Number(form.year) : undefined });
      router.push("/login?registered=1");
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to create your account." : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8"><div className="mx-auto max-w-lg"><Link href="/" className="flex items-center gap-3 font-extrabold"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white" fallback="AICC" />AICC Club</Link><div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Student account</p><h1 className="mt-3 text-3xl font-black tracking-tight">Join AICC Club</h1><p className="mt-3 text-sm leading-6 text-slate-500">Create a student account to discover activities and manage your campus journey.</p>{error && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}<form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></label><label className="sm:col-span-2 text-sm font-bold">College email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Student ID<input value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Year<input type="number" min="1" max="6" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className={inputClass} /></label><label className="sm:col-span-2 text-sm font-bold">Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className={inputClass} /></label><label className="sm:col-span-2 text-sm font-bold">Password<input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={inputClass} /></label><button disabled={loading} className="sm:col-span-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button></form><p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-bold text-indigo-600">Sign in</Link></p></div></div></main>;
}