"use client";

import axios from "axios";
import { ArrowLeft, Bell, CheckCircle2, ClipboardCheck, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

type Activity = { _id: string; title: string; category: string; date: string; status: string; };

const activityDefaults = { title: "", description: "", category: "Workshop", date: "", time: "", venue: "", organizer: "", capacity: "", registrationDeadline: "" };
const statuses = ["pending", "approved", "published", "completed", "cancelled"];
const messageFrom = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

export default function ManagePage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityForm, setActivityForm] = useState(activityDefaults);
  const [attendanceForm, setAttendanceForm] = useState({ studentId: "", activityId: "" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", audience: "all" });
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadActivities = async (authToken: string) => {
    const response = await axios.get("http://localhost:5000/api/activities/manage", { headers: { Authorization: `Bearer ${authToken}` } });
    setActivities(response.data.activities || []);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    const userValue = localStorage.getItem("user");
    const storedRole = userValue ? JSON.parse(userValue).role : "";
    if (!authToken) { router.replace("/login"); return; }
    if (!["faculty", "admin"].includes(storedRole)) { router.replace("/dashboard"); return; }
    const initializeManagement = async () => {
      await Promise.resolve();
      setToken(authToken);
      setRole(storedRole);
      loadActivities(authToken).catch((requestError: unknown) => setError(messageFrom(requestError, "Unable to load activities."))).finally(() => setLoading(false));
    };

    initializeManagement();
  }, [router]);

  const runAction = async (action: () => Promise<void>) => {
    setWorking(true); setError(""); setMessage("");
    try { await action(); } catch (requestError: unknown) { setError(messageFrom(requestError, "The action could not be completed.")); } finally { setWorking(false); }
  };

  const createActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      await axios.post("http://localhost:5000/api/activities", { ...activityForm, capacity: Number(activityForm.capacity) }, { headers: { Authorization: `Bearer ${token}` } });
      setActivityForm(activityDefaults); setMessage("Activity created successfully."); await loadActivities(token);
    });
  };

  const updateStatus = async (activityId: string, status: string) => {
    await runAction(async () => { await axios.patch(`http://localhost:5000/api/activities/${activityId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }); setMessage("Activity status updated."); await loadActivities(token); });
  };

  const markAttendance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => { await axios.post("http://localhost:5000/api/attendance/mark", attendanceForm, { headers: { Authorization: `Bearer ${token}` } }); setAttendanceForm({ studentId: "", activityId: "" }); setMessage("Attendance marked successfully."); });
  };

  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => { await axios.post("http://localhost:5000/api/announcements", announcementForm, { headers: { Authorization: `Bearer ${token}` } }); setAnnouncementForm({ title: "", message: "", audience: "all" }); setMessage("Announcement published successfully."); });
  };

  if (!role || loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading management...</main>;

  const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500";
  const cardClass = "rounded-2xl border border-slate-200 bg-white p-6";

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" /><span className="font-extrabold">AICC Club Management</span></div></div></header><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">{role} workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Manage campus activity</h1><p className="mt-4 max-w-2xl leading-7 text-slate-500">Create AICC activities, track attendance, and keep members up to date.</p>{message && <div className="mt-8 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{message}</div>}{error && <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}

<div className="mt-10 grid gap-6 xl:grid-cols-2">
<section className={cardClass}><div className="flex items-center gap-3"><Plus className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Create activity</h2></div><form onSubmit={createActivity} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Title<input required value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Category<select value={activityForm.category} onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })} className={inputClass}>{["Workshop", "Hackathon", "Seminar", "Competition", "Cultural", "Sports", "Club Activity", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-bold">Capacity<input required type="number" min="1" value={activityForm.capacity} onChange={(e) => setActivityForm({ ...activityForm, capacity: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Date<input required type="date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Registration deadline<input required type="date" value={activityForm.registrationDeadline} onChange={(e) => setActivityForm({ ...activityForm, registrationDeadline: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Time<input required value={activityForm.time} onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Venue<input required value={activityForm.venue} onChange={(e) => setActivityForm({ ...activityForm, venue: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Organizer<input required value={activityForm.organizer} onChange={(e) => setActivityForm({ ...activityForm, organizer: e.target.value })} className={inputClass} /></label><label className="sm:col-span-2 text-sm font-bold">Description<textarea required rows={3} value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500" /></label><button disabled={working} className="sm:col-span-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">Create activity</button></form></section>

<section className={cardClass}><div className="flex items-center gap-3"><Settings2 className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Activities</h2></div><div className="mt-6 space-y-3">{activities.length === 0 ? <p className="text-sm text-slate-500">No activities found.</p> : activities.map((activity) => <div key={activity._id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{activity.title}</p><p className="mt-1 text-xs text-slate-500">{activity.category} · {new Date(activity.date).toLocaleDateString("en-IN")}</p></div><select value={activity.status} onChange={(e) => updateStatus(activity._id, e.target.value)} className="h-10 rounded-lg border border-slate-200 px-2 text-sm font-semibold capitalize outline-none focus:border-indigo-500">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div>)}</div></section>

<section className={cardClass}><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Mark attendance</h2></div><form onSubmit={markAttendance} className="mt-6 space-y-4"><label className="block text-sm font-bold">Activity<select required value={attendanceForm.activityId} onChange={(e) => setAttendanceForm({ ...attendanceForm, activityId: e.target.value })} className={inputClass}><option value="">Select activity</option>{activities.map((activity) => <option key={activity._id} value={activity._id}>{activity.title}</option>)}</select></label><label className="block text-sm font-bold">Student ID or MongoDB user ID<input required value={attendanceForm.studentId} onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })} className={inputClass} /></label><button disabled={working} className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-60">Mark present</button></form></section>


<section className={`${cardClass} xl:col-span-2`}><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Create announcement</h2></div><form onSubmit={createAnnouncement} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Title<input required value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Audience<select value={announcementForm.audience} onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value })} className={inputClass}><option value="all">Everyone</option><option value="students">Students</option><option value="faculty">Faculty</option></select></label><label className="sm:col-span-2 text-sm font-bold">Message<textarea required rows={4} value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500" /></label><button disabled={working} className="sm:col-span-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">Publish announcement</button></form></section>
</div></section></main>;
}
