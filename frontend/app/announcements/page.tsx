"use client";

import axios from "axios";
import { ArrowLeft, Bell, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

type Announcement = { _id: string; title: string; message: string; audience: string; createdAt: string };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [home, setHome] = useState("/dashboard");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }
      const user = localStorage.getItem("user");
      const role = user ? JSON.parse(user).role : "student";
      setHome(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/dashboard");
      try { const response = await axios.get("http://localhost:5000/api/announcements", { headers: { Authorization: `Bearer ${token}` } }); setAnnouncements(response.data.announcements || []); }
      catch { setError("Unable to load announcements."); }
      finally { setLoading(false); }
    };
    fetchAnnouncements();
  }, []);

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><Link href={home} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to portal</Link><div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" /><span className="font-extrabold">AICC Club</span></div></div></header><section className="mx-auto max-w-5xl px-5 py-10 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Campus updates</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Announcements</h1><p className="mt-4 leading-7 text-slate-500">Important news and reminders from your campus.</p>{error && <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}{loading && <div className="mt-12 text-center text-sm text-slate-500">Loading announcements...</div>}{!loading && announcements.length === 0 && !error && <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Bell className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold">No announcements yet</h2></div>}{!loading && announcements.length > 0 && <div className="mt-10 space-y-4">{announcements.map((announcement) => <article key={announcement._id} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{announcement.audience}</span><h2 className="mt-4 text-xl font-black">{announcement.title}</h2></div><p className="flex shrink-0 items-center gap-2 text-sm text-slate-400"><CalendarDays className="h-4 w-4" />{new Date(announcement.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div><p className="mt-4 leading-7 text-slate-600">{announcement.message}</p></article>)}</div>}</section></main>;
}
