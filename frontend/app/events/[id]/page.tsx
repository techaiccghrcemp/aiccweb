"use client";

import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClubLogo } from "../../ClubBranding";

type Activity = {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  capacity: number;
  registrationDeadline: string;
  status: string;
};

export default function EventDetailsPage() {
  const params = useParams();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/activities/${params.id}`
        );

        setActivity(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load activity.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchActivity();
    }
  }, [params.id]);

  const handleRegister = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setRegistering(true);
      setMessage("");
      setError("");

      const response = await axios.post(
        `http://localhost:5000/api/registrations/activity/${params.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading activity...
        </p>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-black">
            Activity not found
          </h1>

          <Link
            href="/events"
            className="mt-5 inline-block font-bold text-indigo-600"
          >
            Back to activities
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/events"
            className="flex items-center gap-2 text-sm font-bold text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to activities
          </Link>

          <div className="flex items-center gap-3">
            <ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />

            <span className="font-extrabold">
              AICC Club
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-950 px-6 py-12 text-white sm:px-10">

            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
              {activity.category}
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              {activity.title}
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-indigo-100">
              {activity.description}
            </p>

          </div>

          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_320px]">

            <div>

              <h2 className="text-xl font-black">
                Activity details
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <Info
                  icon={<CalendarDays />}
                  label="Date"
                  value={new Date(
                    activity.date
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />

                <Info
                  icon={<Clock3 />}
                  label="Time"
                  value={activity.time}
                />

                <Info
                  icon={<MapPin />}
                  label="Venue"
                  value={activity.venue}
                />

                <Info
                  icon={<Users />}
                  label="Capacity"
                  value={`${activity.capacity} participants`}
                />

              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Organized by
                </p>

                <p className="mt-2 font-bold">
                  {activity.organizer}
                </p>

              </div>

            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 p-5">

              <p className="text-sm font-semibold text-slate-500">
                Registration deadline
              </p>

              <p className="mt-2 font-bold">
                {new Date(
                  activity.registrationDeadline
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              {message && (
                <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">

                  <CheckCircle2 className="h-5 w-5 shrink-0" />

                  {message}

                </div>
              )}

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={registering || !!message}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registering
                  ? "Registering..."
                  : message
                  ? "Registered"
                  : "Register for activity"}
              </button>

            </aside>

          </div>

        </div>
      </section>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold">
          {value}
        </p>

      </div>

    </div>
  );
}