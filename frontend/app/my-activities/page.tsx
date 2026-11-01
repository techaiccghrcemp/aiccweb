"use client";

import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

type Activity = {
  _id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
};

type Registration = {
  _id: string;
  status: string;
  activity: Activity | null;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function MyActivitiesPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/registrations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRegistrations(response.data.registrations || []);
      } catch (requestError: unknown) {
        if (
          axios.isAxiosError(requestError) &&
          [401, 403].includes(requestError.response?.status || 0)
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        setError("Unable to load your activities. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />
            <span className="font-extrabold">AICC Club</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
            Your journey
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            My Activities
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-500">
            Keep track of the campus activities you have joined.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-12 text-center text-sm text-slate-500">
            Loading your activities...
          </div>
        )}

        {!loading && registrations.length === 0 && !error && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 font-bold">No registered activities yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Explore campus activities and register for your next experience.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Explore activities
            </Link>
          </div>
        )}

        {!loading && registrations.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((registration) => {
              const activity = registration.activity;

              if (!activity) {
                return null;
              }

              return (
                <article
                  key={registration._id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {activity.category}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                      {registration.status}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-bold leading-6">
                    {activity.title}
                  </h2>

                  <div className="mt-5 space-y-3 text-sm text-slate-500">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />
                      {formatDate(activity.date)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-4 w-4 shrink-0 text-indigo-500" />
                      {activity.time}
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                      {activity.venue}
                    </div>
                    <div className="flex items-center gap-3">
                      <UserRound className="h-4 w-4 shrink-0 text-indigo-500" />
                      {activity.organizer}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <Link
                      href={`/events/${activity._id}`}
                      className="block rounded-xl bg-slate-950 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-600"
                    >
                      View activity
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
