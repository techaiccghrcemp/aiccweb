"use client";

import axios from "axios";
import { CheckCircle2, ClipboardCheck, Search, Users, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Activity = { _id: string; title: string; date: string; category: string };
type Student = { _id: string; name: string; email: string; studentId?: string };
type Registration = { _id: string; student: Student };
type AttendanceRecord = { student: Student; status: "present" | "absent" };
type Props = { portalRole: "faculty" | "admin" };
const API = "http://localhost:5000/api";

export default function AttendanceManager({ portalRole }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activityId, setActivityId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const token = typeof window === "undefined" ? "" : localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { window.location.href = "/login"; return; }
    axios.get(`${API}/activities/manage`, { headers })
      .then((response) => setActivities(response.data.activities || []))
      .catch(() => setError("Unable to load activities."))
      .finally(() => setLoading(false));
  }, []);

  const loadRoster = async (selectedActivity: string) => {
    setActivityId(selectedActivity);
    setError("");
    if (!selectedActivity) { setRegistrations([]); setAttendance([]); return; }
    setRosterLoading(true);
    try {
      const [registrationResponse, attendanceResponse] = await Promise.all([
        axios.get(`${API}/registrations/activity/${selectedActivity}`, { headers }),
        axios.get(`${API}/attendance/activity/${selectedActivity}`, { headers }),
      ]);
      setRegistrations(registrationResponse.data.registrations || []);
      setAttendance(attendanceResponse.data.attendance || []);
    } catch { setError("Unable to load the selected activity roster."); }
    finally { setRosterLoading(false); }
  };

  const attendanceByStudent = new Map(attendance.map((record) => [record.student._id, record.status]));
  const rows = useMemo(() => registrations.filter((registration) => {
    const student = registration.student;
    const currentStatus = attendanceByStudent.get(student._id) || "not marked";
    const searchable = `${student.name} ${student.email} ${student.studentId || ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (statusFilter === "all" || currentStatus === statusFilter);
  }), [registrations, attendance, query, statusFilter]);
  const presentCount = registrations.filter((item) => attendanceByStudent.get(item.student._id) === "present").length;
  const absentCount = registrations.filter((item) => attendanceByStudent.get(item.student._id) === "absent").length;
  const totalCount = registrations.length;
  const percentage = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;
  const metrics = [
    { label: "Present", value: presentCount, Icon: CheckCircle2, color: "text-emerald-600", background: "bg-emerald-50" },
    { label: "Absent", value: absentCount, Icon: XCircle, color: "text-rose-600", background: "bg-rose-50" },
    { label: "Total", value: totalCount, Icon: Users, color: "text-indigo-600", background: "bg-indigo-50" },
    { label: "Attendance", value: `${percentage}%`, Icon: ClipboardCheck, color: "text-amber-600", background: "bg-amber-50" },
  ];

  const mark = async (student: Student, status: "present" | "absent") => {
    setSaving(student._id); setError("");
    try {
      await axios.post(`${API}/attendance/mark`, { activityId, studentId: student._id, status }, { headers });
      setAttendance((current) => [...current.filter((record) => record.student._id !== student._id), { student, status }]);
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to save attendance." : "Unable to save attendance.");
    } finally { setSaving(""); }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading {portalRole} attendance...</main>;

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-6 text-slate-950 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{portalRole} operations</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Attendance management</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Select an activity, review its registered students, and record attendance without losing the audit trail.</p></div>
        {error && <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><label className="block text-sm font-bold text-slate-700">Select activity<select value={activityId} onChange={(event) => void loadRoster(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"><option value="">Choose an activity</option>{activities.map((activity) => <option key={activity._id} value={activity._id}>{activity.title} · {new Date(activity.date).toLocaleDateString("en-IN")}</option>)}</select></label></section>
        {activityId && <>
          <section className="mt-6 grid gap-4 sm:grid-cols-4">{metrics.map(({ label, value, Icon, color, background }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${background}`}><Icon className={`h-4 w-4 ${color}`} /></div><p className="mt-4 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}</section>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Registered students</h2><p className="mt-1 text-sm text-slate-500">{totalCount} students in this activity roster.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student" className="h-10 w-full bg-transparent text-sm outline-none" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><option value="all">All statuses</option><option value="present">Present</option><option value="absent">Absent</option><option value="not marked">Not marked</option></select></div></div>{rosterLoading ? <p className="p-12 text-center text-sm text-slate-500">Loading roster...</p> : rows.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No registered students match your filters.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-400"><tr><th className="px-5 py-4">Student</th><th>Student ID</th><th>Status</th><th className="pr-5">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((registration) => { const student = registration.student; const currentStatus = attendanceByStudent.get(student._id); return <tr key={registration._id} className="hover:bg-indigo-50/30"><td className="px-5 py-4"><p className="font-bold text-slate-800">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.email}</p></td><td className="text-slate-500">{student.studentId || "-"}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${currentStatus === "present" ? "bg-emerald-50 text-emerald-700" : currentStatus === "absent" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"}`}>{currentStatus || "Not marked"}</span></td><td className="pr-5"><div className="flex gap-2"><button type="button" disabled={saving === student._id} onClick={() => void mark(student, "present")} className={`rounded-lg px-3 py-2 text-xs font-bold ${currentStatus === "present" ? "bg-emerald-100 text-emerald-700" : "bg-slate-950 text-white hover:bg-indigo-600"}`}>{currentStatus === "present" ? "Present ✓" : "Mark present"}</button><button type="button" disabled={saving === student._id} onClick={() => void mark(student, "absent")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Absent</button></div></td></tr>; })}</tbody></table></div>}</section>
        </>}
      </div>
    </main>
  );
}
