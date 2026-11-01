"use client";

import axios from "axios";
import Image from "next/image";
import {
  Activity as ActivityIcon,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  LogOut,
  Megaphone,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClubLogo } from "../ClubBranding";

type Activity = { _id: string; title: string; category: string; date: string; status: string };
type Student = { _id: string; name: string; email: string; studentId?: string };
type Registration = { _id: string; student: Student };
type Stats = { students: number; faculty: number; activities: number; registrations: number; attendance: number; announcements: number; feedback: number };
type Feedback = { _id: string; rating: number; comment?: string; student?: { name: string } };
type TeamMember = { _id: string; name: string; position: string; photoUrl: string };

type PortalProps = { portalRole: "faculty" | "admin" };
const API = "http://localhost:5000/api";
const statuses = ["pending", "approved", "published", "completed", "cancelled"];
const categories = ["Workshop", "Hackathon", "Seminar", "Competition", "Cultural", "Sports", "Club Activity", "Other"];
const emptyActivity = { title: "", description: "", category: "Workshop", date: "", time: "", venue: "", organizer: "", capacity: "", registrationDeadline: "" };

function errorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
}

export default function PortalPage({ portalRole }: PortalProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<{ _id: string; name: string; email: string; role: string }[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<{ _id: string; student?: { name: string }; activity?: { title: string }; status: string }[]>([]);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [attendance, setAttendance] = useState({ activityId: "", studentId: "", status: "present" });
  const [announcement, setAnnouncement] = useState({ title: "", message: "", audience: "all" });
  const [feedbackActivity, setFeedbackActivity] = useState("");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMemberName, setTeamMemberName] = useState("");
  const [teamMemberPosition, setTeamMemberPosition] = useState("");
  const [teamMemberPhoto, setTeamMemberPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = (authToken = token) => ({ Authorization: `Bearer ${authToken}` });

  const loadActivities = async (authToken: string) => {
    const response = await axios.get(`${API}/activities/manage`, { headers: authHeaders(authToken) });
    setActivities(response.data.activities || []);
  };

  const loadRoster = async (activityId: string) => {
    if (!activityId) { setRegistrations([]); return; }
    const response = await axios.get(`${API}/registrations/activity/${activityId}`, { headers: authHeaders() });
    setRegistrations(response.data.registrations || []);
  };

  const loadFeedback = async (activityId: string) => {
    if (!activityId) { setFeedback([]); return; }
    const response = await axios.get(`${API}/feedback/activity/${activityId}`, { headers: authHeaders() });
    setFeedback(response.data.feedback || []);
  };

  const loadTeamMembers = async (authToken: string) => {
    const response = await axios.get(`${API}/admin/team-members`, { headers: authHeaders(authToken) });
    setTeamMembers(response.data.members || []);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (!authToken || !parsedUser || parsedUser.role !== portalRole) {
      router.replace(parsedUser?.role === "student" ? "/dashboard" : "/login");
      return;
    }
    setToken(authToken);
    setUser(parsedUser);
    const requests: Promise<unknown>[] = [loadActivities(authToken)];
    if (portalRole === "admin") {
      requests.push(axios.get(`${API}/admin/stats`, { headers: authHeaders(authToken) }).then((response) => setStats(response.data.stats)));
      requests.push(axios.get(`${API}/admin/users`, { headers: authHeaders(authToken) }).then((response) => setUsers(response.data.users || [])));
      requests.push(axios.get(`${API}/admin/records`, { headers: authHeaders(authToken) }).then((response) => setRecentRegistrations((response.data.registrations || []).slice(0, 6))));
      requests.push(loadTeamMembers(authToken));
    }
    Promise.all(requests)
      .catch((requestError: unknown) => setError(errorMessage(requestError, "Unable to load the portal.")))
      .finally(() => setLoading(false));
  }, [portalRole, router]);

  useEffect(() => {
    if (portalRole !== "admin" || loading) return;

    const scrollToTeam = () => {
      if (window.location.hash === "#team-members") {
        document.getElementById("team-members")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    scrollToTeam();
    window.addEventListener("hashchange", scrollToTeam);
    return () => window.removeEventListener("hashchange", scrollToTeam);
  }, [loading, portalRole]);

  const runAction = async (action: () => Promise<void>) => {
    setWorking(true); setMessage(""); setError("");
    try { await action(); } catch (requestError: unknown) { setError(errorMessage(requestError, "The action could not be completed.")); }
    finally { setWorking(false); }
  };

  const createActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      await axios.post(`${API}/activities`, { ...activityForm, capacity: Number(activityForm.capacity) }, { headers: authHeaders() });
      setActivityForm(emptyActivity); setMessage("Activity saved as pending review."); await loadActivities(token);
    });
  };

  const updateStatus = async (activityId: string, status: string) => runAction(async () => {
    await axios.patch(`${API}/activities/${activityId}/status`, { status }, { headers: authHeaders() });
    setMessage("Activity status updated."); await loadActivities(token);
  });

  const markAttendance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => { await axios.post(`${API}/attendance/mark`, attendance, { headers: authHeaders() }); setMessage(`Attendance marked ${attendance.status}.`); });
  };

  const publishAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => { await axios.post(`${API}/announcements`, announcement, { headers: authHeaders() }); setAnnouncement({ title: "", message: "", audience: "all" }); setMessage("Announcement published."); });
  };

  const uploadTeamMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teamMemberPhoto) {
      setError("Choose a team member photo before uploading.");
      setMessage("");
      return;
    }

    await runAction(async () => {
      const formData = new FormData();
      formData.set("name", teamMemberName);
      formData.set("position", teamMemberPosition);
      formData.set("photo", teamMemberPhoto);
      const form = event.currentTarget;
      const response = await axios.post(`${API}/admin/team-members`, formData, {
        headers: authHeaders(),
      });
      setTeamMemberName("");
      setTeamMemberPosition("");
      setTeamMemberPhoto(null);
      form.reset();
      setMessage(response.data.message || "Team member added.");
      await loadTeamMembers(token);
    });
  };

  const removeTeamMember = async (memberId: string) => runAction(async () => {
    const response = await axios.delete(`${API}/admin/team-members/${memberId}`, { headers: authHeaders() });
    setMessage(response.data.warning || response.data.message || "Team member removed.");
    await loadTeamMembers(token);
  });

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.replace("/login"); };
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const cardClass = "ek-hover-lift ek-surface rounded-3xl p-6";

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading {portalRole} portal...</main>;

  return (
    <main className="ek-operations ek-fade-in min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href={portalRole === "admin" ? "/admin" : "/faculty"} className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" /><span className="font-extrabold">AICC Club <span className="ml-2 hidden text-xs font-bold uppercase tracking-widest text-slate-400 sm:inline">{portalRole} portal</span></span></Link>
          <div className="flex items-center gap-2"><Link href="/profile" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 sm:inline">{user?.name}</Link><button onClick={logout} aria-label="Sign out" className="rounded-xl p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><LogOut className="h-5 w-5" /></button></div>
        </div>
      </header>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8">
        <div className="ek-reveal flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Operations workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{portalRole === "admin" ? "Institution control room" : "Faculty activity desk"}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-500">{portalRole === "admin" ? "Monitor the entire student activity system, its people, and its participation records." : "Shape campus programming, manage your rosters, and turn participation into meaningful outcomes."}</p></div><div className="flex gap-3"><Link href="/profile" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600">Profile</Link><Link href="/settings" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600">Settings</Link></div></div>
        {message && <div className="mt-8 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{message}</div>}
        {error && <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
        {portalRole === "admin" && <AdminOverview stats={stats} users={users} registrations={recentRegistrations} />}
        {portalRole === "admin" && <TeamMemberManager members={teamMembers} name={teamMemberName} position={teamMemberPosition} photo={teamMemberPhoto} setName={setTeamMemberName} setPosition={setTeamMemberPosition} setPhoto={setTeamMemberPhoto} onSubmit={uploadTeamMember} onDelete={(memberId) => { if (window.confirm("Remove this member from the About section?")) void removeTeamMember(memberId); }} working={working} inputClass={inputClass} />}
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <ActivityCreator form={activityForm} setForm={setActivityForm} onSubmit={createActivity} inputClass={inputClass} working={working} cardClass={cardClass} />
          <ActivityControl activities={activities} updateStatus={updateStatus} cardClass={cardClass} />
          <AttendanceDesk activities={activities} registrations={registrations} attendance={attendance} setAttendance={setAttendance} loadRoster={loadRoster} onSubmit={markAttendance} inputClass={inputClass} working={working} cardClass={cardClass} />
          <FeedbackDesk activities={activities} selected={feedbackActivity} setSelected={setFeedbackActivity} feedback={feedback} loadFeedback={loadFeedback} inputClass={inputClass} cardClass={cardClass} />
          <AnnouncementDesk announcement={announcement} setAnnouncement={setAnnouncement} onSubmit={publishAnnouncement} inputClass={inputClass} working={working} cardClass={cardClass} />
        </div>
      </section>
    </main>
  );
}

function AdminOverview({ stats, users, registrations }: { stats: Stats | null; users: { _id: string; name: string; email: string; role: string }[]; registrations: { _id: string; student?: { name: string }; activity?: { title: string }; status: string }[] }) {
  const metrics: { label: string; value?: number; icon: LucideIcon }[] = [
    { label: "Students", value: stats?.students, icon: Users }, { label: "Faculty", value: stats?.faculty, icon: ShieldCheck }, { label: "Activities", value: stats?.activities, icon: ActivityIcon }, { label: "Registrations", value: stats?.registrations, icon: ClipboardCheck }, { label: "Attendance", value: stats?.attendance, icon: CheckCircle2 }, { label: "Announcements", value: stats?.announcements, icon: Megaphone }, { label: "Feedback", value: stats?.feedback, icon: MessageSquare },
  ];
  return <><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="ek-hover-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value ?? 0}</p></div>)}</div><section className="ek-hover-lift mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">User directory</h2></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th></tr></thead><tbody>{users.slice(0, 12).map((record) => <tr key={record._id} className="border-b border-slate-50"><td className="px-3 py-3 font-bold">{record.name}</td><td className="px-3 py-3 text-slate-500">{record.email}</td><td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{record.role}</span></td></tr>)}</tbody></table></div></section></>;
}

function TeamMemberManager({
  members,
  name,
  position,
  photo,
  setName,
  setPosition,
  setPhoto,
  onSubmit,
  onDelete,
  working,
  inputClass,
}: {
  members: TeamMember[];
  name: string;
  position: string;
  photo: File | null;
  setName: (value: string) => void;
  setPosition: (value: string) => void;
  setPhoto: (value: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (memberId: string) => void;
  working: boolean;
  inputClass: string;
}) {
  return (
    <section id="team-members" className="ek-surface mt-6 scroll-mt-24 rounded-3xl p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-black">About section team</h2>
            <p className="mt-1 text-sm text-slate-500">Manage the profiles shown on the public homepage.</p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">{members.length} {members.length === 1 ? "profile" : "profiles"}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto] lg:items-end">
        <label className="text-sm font-bold">Full name
          <input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex Morgan" className={inputClass} />
        </label>
        <label className="text-sm font-bold">Position
          <input required maxLength={100} value={position} onChange={(event) => setPosition(event.target.value)} placeholder="e.g. Club President" className={inputClass} />
        </label>
        <label className="text-sm font-bold">Portrait photo
          <input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className={`${inputClass} h-auto py-2`} />
          <span className="mt-1 block text-xs font-medium text-slate-500">JPEG, PNG, WebP, or GIF · max 5 MB</span>
        </label>
        <button disabled={working} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          <ImagePlus className="h-4 w-4" />
          {working ? "Saving..." : "Add member"}
        </button>
      </form>

      {members.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">No team profiles yet. Add the first member above.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <li key={member._id} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image src={`${API.replace(/\/api$/, "")}${member.photoUrl}`} alt="" fill sizes="64px" unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">{member.name}</p>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">{member.position}</p>
              </div>
              <button type="button" disabled={working} onClick={() => onDelete(member._id)} aria-label={`Remove ${member.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityCreator({ form, setForm, onSubmit, inputClass, working, cardClass }: any) { return <section className={cardClass}><div className="flex items-center gap-3"><Plus className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Create activity</h2></div><form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-bold">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></label><label className="sm:col-span-2 text-sm font-bold">Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-auto py-3`} /></label><label className="text-sm font-bold">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-sm font-bold">Capacity<input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Deadline<input required type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Time<input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Venue<input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Organizer<input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className={inputClass} /></label><button disabled={working} className="sm:col-span-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{working ? "Saving..." : "Create pending activity"}</button></form></section>; }

function ActivityControl({ activities, updateStatus, cardClass }: any) { return <section className={cardClass}><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Activity control</h2></div><div className="mt-6 space-y-3">{activities.length === 0 ? <p className="text-sm text-slate-500">No activities found.</p> : activities.map((activity: Activity) => <div key={activity._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{activity.title}</p><p className="mt-1 text-xs text-slate-500">{activity.category} · {new Date(activity.date).toLocaleDateString("en-IN")}</p></div><select value={activity.status} onChange={(e) => updateStatus(activity._id, e.target.value)} className="h-10 rounded-lg border border-slate-200 px-2 text-sm font-semibold capitalize outline-none focus:border-indigo-500">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div>)}</div></section>; }

function AttendanceDesk({ activities, registrations, attendance, setAttendance, loadRoster, onSubmit, inputClass, working, cardClass }: any) { return <section className={cardClass}><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-indigo-600" /><div><h2 className="text-xl font-black">Attendance desk</h2><p className="mt-1 text-sm text-slate-500">Record or correct a registered student&apos;s attendance.</p></div></div><form onSubmit={onSubmit} className="mt-6 space-y-4"><label className="block text-sm font-bold">Activity<select required value={attendance.activityId} onChange={async (e) => { setAttendance({ activityId: e.target.value, studentId: "", status: "present" }); await loadRoster(e.target.value); }} className={inputClass}><option value="">Select activity</option>{activities.map((activity: Activity) => <option key={activity._id} value={activity._id}>{activity.title}</option>)}</select></label><label className="block text-sm font-bold">Registered student<select required value={attendance.studentId} onChange={(e) => setAttendance({ ...attendance, studentId: e.target.value })} className={inputClass}><option value="">Select student</option>{registrations.map((record: Registration) => <option key={record.student._id} value={record.student._id}>{record.student.name}</option>)}</select></label><label className="block text-sm font-bold">Attendance status<select value={attendance.status} onChange={(e) => setAttendance({ ...attendance, status: e.target.value })} className={inputClass}><option value="present">Present</option><option value="absent">Absent</option></select></label><button disabled={working || !registrations.length || !attendance.studentId} className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-50">{working ? "Saving..." : `Mark ${attendance.status}`}</button></form></section>; }


function FeedbackDesk({ activities, selected, setSelected, feedback, loadFeedback, inputClass, cardClass }: any) { return <section className={`${cardClass} xl:col-span-2`}><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Feedback review</h2></div><select value={selected} onChange={async (e) => { setSelected(e.target.value); await loadFeedback(e.target.value); }} className={`${inputClass} mt-5`}><option value="">Select activity</option>{activities.map((activity: Activity) => <option key={activity._id} value={activity._id}>{activity.title}</option>)}</select><div className="mt-5 grid gap-3 md:grid-cols-2">{feedback.length ? feedback.map((item: Feedback) => <article key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex justify-between gap-3"><p className="font-bold">{item.student?.name || "Student"}</p><span className="font-black text-amber-500">{item.rating}/5</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.comment || "No written comment."}</p></article>) : <p className="text-sm text-slate-500">Select an activity to review submitted feedback.</p>}</div></section>; }

function AnnouncementDesk({ announcement, setAnnouncement, onSubmit, inputClass, working, cardClass }: any) { return <section className={`${cardClass} xl:col-span-2`}><div className="flex items-center gap-3"><Megaphone className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-black">Publish announcement</h2></div><form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Title<input required value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} className={inputClass} /></label><label className="text-sm font-bold">Audience<select value={announcement.audience} onChange={(e) => setAnnouncement({ ...announcement, audience: e.target.value })} className={inputClass}><option value="all">Everyone</option><option value="students">Students</option><option value="faculty">Faculty</option></select></label><label className="sm:col-span-2 text-sm font-bold">Message<textarea required rows={4} value={announcement.message} onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })} className={`${inputClass} h-auto py-3`} /></label><button disabled={working} className="sm:col-span-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">Publish announcement</button></form></section>; }
