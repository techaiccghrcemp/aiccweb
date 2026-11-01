"use client";

import axios from "axios";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

type Activity = {
  _id: string;
  title: string;
  date: string;
};

type AttendanceRecord = {
  _id: string;
  status: "present" | "absent";
  checkedInAt?: string;
  activity: Activity | null;
};

export default function AttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/attendance/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(response.data.attendance || []);
      } catch (requestError: unknown) {
        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        setError("Unable to load attendance records.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" /><span className="font-extrabold">AICC Club</span></div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Participation</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Attendance</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-500">See your attendance records for campus activities.</p>
        {error && <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
        {loading && <div className="mt-12 text-center text-sm text-slate-500">Loading attendance...</div>}
        {!loading && records.length === 0 && !error && <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CalendarDays className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold">No attendance records yet</h2><p className="mt-2 text-sm text-slate-500">Your checked-in activities will appear here.</p></div>}
        {!loading && records.length > 0 && <div className="mt-10 space-y-4">{records.map((record) => record.activity && <article key={record._id} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">{record.activity.title}</h2><div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-500" />{new Date(record.activity.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>{record.checkedInAt && <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-indigo-500" />{new Date(record.checkedInAt).toLocaleString("en-IN")}</span>}</div></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize ${record.status === "present" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{record.status === "present" && <CheckCircle2 className="h-4 w-4" />}{record.status}</span></article>)}</div>}
      </section>
    </main>
  );
}
