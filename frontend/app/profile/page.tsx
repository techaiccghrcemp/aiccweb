"use client";

import axios from "axios";
import { ArrowLeft, CheckCircle2, Mail, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClubLogo } from "../ClubBranding";

type Profile = { id?: string; _id?: string; name: string; email: string; studentId?: string; department?: string; year?: number; phone?: string; role: string };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", department: "", year: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    const stored = localStorage.getItem("user");
    if (stored) {
      const value = JSON.parse(stored) as Profile;
      setProfile(value);
      setForm({ name: value.name || "", department: value.department || "", year: value.year ? String(value.year) : "", phone: value.phone || "" });
    }
    axios.get("http://localhost:5000/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const value = response.data.user as Profile;
        setProfile(value);
        setForm({ name: value.name || "", department: value.department || "", year: value.year ? String(value.year) : "", phone: value.phone || "" });
      })
      .catch(() => setError("Unable to load the latest profile."))
      .finally(() => setLoading(false));
  }, [router]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await axios.patch("http://localhost:5000/api/auth/profile", { ...form, year: form.year ? Number(form.year) : undefined }, { headers: { Authorization: `Bearer ${token}` } });
      const value = response.data.user as Profile;
      localStorage.setItem("user", JSON.stringify(value));
      setProfile(value);
      setMessage("Your profile has been updated.");
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to update your profile." : "Unable to update your profile.");
    } finally { setSaving(false); }
  };

  const input = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading profile...</main>;

  return <main className="min-h-screen bg-[#f6f7fb] text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8"><Link href={profile?.role === "faculty" ? "/faculty" : profile?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to portal</Link><div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white" fallback="AICC" /><span className="font-extrabold">Account</span></div></div></header><section className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Account center</p><h1 className="mt-3 text-4xl font-black tracking-tight">Your profile</h1><p className="mt-4 leading-7 text-slate-500">Keep your campus identity and contact details current.</p></div><div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]"><aside className="rounded-3xl bg-slate-950 p-6 text-white"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-2xl font-black">{profile?.name?.charAt(0).toUpperCase() || "E"}</div><h2 className="mt-6 text-xl font-black">{profile?.name}</h2><p className="mt-1 text-sm text-slate-400">{profile?.role}</p><div className="mt-8 space-y-4 text-sm text-slate-300"><p className="flex items-center gap-3"><Mail className="h-4 w-4 text-indigo-300" />{profile?.email}</p><p className="flex items-center gap-3"><UserRound className="h-4 w-4 text-indigo-300" />{profile?.studentId || "Staff account"}</p></div></aside><form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">Personal details</h2><p className="mt-1 text-sm text-slate-500">Your email and role are managed by the institution.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{profile?.role}</span></div>{error && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}{message && <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{message}</div>}<div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={input} /></label><label className="text-sm font-bold">Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className={input} /></label><label className="text-sm font-bold">Year<input type="number" min="1" max="6" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className={input} /></label><label className="sm:col-span-2 text-sm font-bold">Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={input} /></label><div className="sm:col-span-2 flex justify-end"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save changes"}</button></div></div></form></div></section></main>;
}
