"use client";

import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

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

export default function EventsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/activities"
        );

        setActivities(response.data.activities || []);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter((activity) =>
    `${activity.title} ${activity.category} ${activity.venue}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link href="/dashboard" className="flex items-center gap-3">
            <ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />

            <div>
              <p className="font-extrabold">AICC Club</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Explore
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* Page */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
            Discover
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Find your next campus experience.
          </h1>

          <p className="mt-4 leading-7 text-slate-500">
            Explore workshops, hackathons, competitions, sports and
            other activities happening around your campus.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 flex max-w-2xl items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search events, categories or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 text-center text-sm text-slate-500">
            Loading activities...
          </div>
        )}

        {/* Events */}
        {!loading && (
          <div className="mt-10">

            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                {filteredActivities.length} activities available
              </p>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                <h2 className="mt-4 font-bold">
                  No activities found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredActivities.map((activity) => (
                  <article
                    key={activity._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-900/5"
                  >

                    {/* Card visual */}
                    <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-950 p-5">

                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                        {activity.category}
                      </span>

                      <div className="absolute bottom-4 right-4 rounded-xl bg-white px-3 py-2 text-center shadow-lg">
                        <CalendarDays className="mx-auto h-4 w-4 text-indigo-600" />
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          {new Date(activity.date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">

                      <h2 className="text-lg font-bold leading-6">
                        {activity.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {activity.description}
                      </p>

                      <div className="mt-5 space-y-2 text-xs text-slate-500">

                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-slate-400" />
                          {activity.time}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {activity.venue}
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          Up to {activity.capacity} participants
                        </div>

                      </div>

                      <Link
                        href={`/events/${activity._id}`}
                        className="mt-6 block w-full rounded-xl bg-slate-950 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-600"
                      >
                        View activity
                      </Link>

                    </div>
                  </article>
                ))}

              </div>
            )}
          </div>
        )}

      </section>
    </main>
  );
}