"use client";

import axios from "axios";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,

  Trophy,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Activity = { _id: string; title: string; category: string; date: string; time: string; venue: string };
type Registration = { _id: string };
type Announcement = { title: string; message: string };

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registered, setRegistered] = useState(0);
  const [attended, setAttended] = useState(0);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "faculty") {
        router.replace("/faculty");
        return;
      }
      if (parsedUser.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(parsedUser);
      const headers = { Authorization: `Bearer ${token}` };
      Promise.all([
        axios.get("http://localhost:5000/api/activities"),
        axios.get("http://localhost:5000/api/registrations/my", { headers }),
        axios.get("http://localhost:5000/api/attendance/my", { headers }),
        axios.get("http://localhost:5000/api/announcements", { headers }),
      ]).then(([activityResponse, registrationResponse, attendanceResponse, announcementResponse]) => {
        setActivities((activityResponse.data.activities || []).slice(0, 3));
        setRegistered((registrationResponse.data.registrations || []).filter((item: { status: string }) => item.status === "registered").length);
        setAttended((attendanceResponse.data.attendance || []).filter((item: { status: string }) => item.status === "present").length);
        setAnnouncement((announcementResponse.data.announcements || [])[0] || null);
      }).catch(() => undefined);
    }
  }, [router]);


  return (
    <main className="ek-student-dashboard ek-fade-in min-h-screen overflow-x-hidden bg-[#f5f7fb] text-slate-950">

      <section>

        {/* Dashboard Body */}
        <div className="p-5 sm:p-8 lg:p-10">

          {/* Welcome */}
          <section className="ek-reveal relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[28px] border-indigo-500/20" />
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-indigo-300">
                Good morning 👋
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Discover what's happening around campus and keep your
                student activity journey organized.
              </p>

              <button
                onClick={() => router.push("/events")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold transition hover:bg-indigo-500"
              >
                Explore activities
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Stats */}
          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Registered"
              value={String(registered)}
              note="Activities joined"
            />

            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Attended"
              value={String(attended)}
              note="This semester"
            />

            

            <StatCard
              icon={<Trophy className="h-5 w-5" />}
              label="Activity points"
              value={String(attended * 10)}
              note="Participation score"
            />

          </section>

          {/* Main Grid */}
          <section className="mt-8 grid gap-8 xl:grid-cols-1">

            {/* Upcoming */}
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Discover
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Upcoming activities
                  </h2>
                </div>

                <Link href="/events" className="hidden items-center gap-1 text-sm font-bold text-indigo-600 sm:flex">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="group ek-hover-lift flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 text-indigo-700 ring-1 ring-indigo-100">
                      <span className="text-xs font-bold">
                        {new Date(activity.date).toLocaleDateString("en-IN", { month: "short" })}
                      </span>

                      <span className="text-2xl font-black">
                        {new Date(activity.date).toLocaleDateString("en-IN", { day: "2-digit" })}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        {activity.category}
                      </span>

                      <h3 className="mt-1 font-bold">
                        {activity.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {activity.time}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {activity.venue}
                        </span>
                      </div>
                    </div>

                    <Link href={`/events/${activity._id}`} className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* Announcement */}
          {announcement && <section className="mt-8 rounded-2xl border border-cyan-100 bg-gradient-to-r from-indigo-50 to-cyan-50 p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Campus announcement
                </p>

                <h3 className="mt-1 font-bold text-slate-900">
                  {announcement.title}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {announcement.message}
                </p>
              </div>
            </div>
          </section>}

        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="ek-hover-lift ek-surface relative overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-indigo-50/70" />
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <span className="text-3xl font-black">{value}</span>
        <span className="pb-1 text-xs text-slate-400">{note}</span>
      </div>
    </div>
  );
}

