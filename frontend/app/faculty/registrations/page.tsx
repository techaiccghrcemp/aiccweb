"use client";

import axios from "axios";
import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Activity = { _id: string; title: string; date: string };
type Student = { name: string; email: string; studentId?: string };
type Registration = { _id: string; student: Student; registeredAt: string; status: string; activity?: { title: string } };
const API = "http://localhost:5000/api";

export default function FacultyRegistrationsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activityId, setActivityId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { window.location.href = "/login"; return; }
    axios.get(`${API}/activities/manage`, { headers }).then((response) => setActivities(response.data.activities || [])).catch(() => setError("Unable to load activities.")).finally(() => setLoading(false));
  }, []);

  const loadRegistrations = async (selectedActivity: string) => {
    setActivityId(selectedActivity); setRegistrations([]); setError("");
    if (!selectedActivity) return;
    try { const response = await axios.get(`${API}/registrations/activity/${selectedActivity}`, { headers }); setRegistrations(response.data.registrations || []); }
    catch (requestError: unknown) { setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to load registrations." : "Unable to load registrations."); }
  };

  const filtered = useMemo(() => registrations.filter((registration) => `${registration.student.name} ${registration.student.email} ${registration.student.studentId || ""}`.toLowerCase().includes(query.toLowerCase())), [registrations, query]);
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading registrations...</main>;
  return <main className="min-h-screen bg-[#f6f7fb] px-5 py-6 text-slate-950 sm:px-8 sm:py-8"><div className="mx-auto max-w-7xl"><section className="rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Faculty operations</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Registrations</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Review the students registered for each activity and prepare your event roster.</p></section>{error && <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}<section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><label className="block text-sm font-bold">Activity<select value={activityId} onChange={(event) => void loadRegistrations(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"><option value="">Choose an activity</option>{activities.map((activity) => <option key={activity._id} value={activity._id}>{activity.title}</option>)}</select></label></section>{activityId && <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-indigo-600" /><div><h2 className="font-black">Registered students</h2><p className="mt-1 text-sm text-slate-500">{registrations.length} registered</p></div></div><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student" className="h-10 w-full bg-transparent text-sm outline-none" /></label></div>{filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-400"><tr><th className="px-5 py-4">Student</th><th>Student ID</th><th>Registration date</th><th className="pr-5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((registration) => <tr key={registration._id} className="hover:bg-indigo-50/30"><td className="px-5 py-4"><p className="font-bold text-slate-800">{registration.student.name}</p><p className="mt-1 text-xs text-slate-500">{registration.student.email}</p></td><td className="text-slate-500">{registration.student.studentId || "-"}</td><td className="text-slate-500">{new Date(registration.registeredAt).toLocaleDateString("en-IN")}</td><td className="pr-5"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold capitalize text-emerald-700">{registration.status}</span></td></tr>)}</tbody></table></div> : <p className="p-12 text-center text-sm text-slate-500">No registrations match your search.</p>}</section>}</div></main>;
}
