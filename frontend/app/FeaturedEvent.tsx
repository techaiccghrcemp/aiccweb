"use client";

import axios from "axios";
import { CalendarDays, Clock3, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Activity = {
  _id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  status: string;
};

const API = "http://localhost:5000/api";

function getActivityStart(activity: Activity) {
  const date = activity.date.slice(0, 10).split("-").map(Number);
  if (date.length !== 3 || date.some(Number.isNaN)) return Number.NaN;

  const time = activity.time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  let hours = time ? Number(time[1]) : 0;
  const minutes = time?.[2] ? Number(time[2]) : 0;
  const meridiem = time?.[3]?.toLowerCase();

  if (meridiem) {
    if (hours < 1 || hours > 12 || minutes > 59) return Number.NaN;
    hours = (hours % 12) + (meridiem === "pm" ? 12 : 0);
  } else if (hours > 23 || minutes > 59) {
    return Number.NaN;
  }

  return new Date(date[0], date[1] - 1, date[2], hours, minutes).getTime();
}

function formatActivityDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "Date to be announced";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function FeaturedEvent() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void axios
      .get<{ activities: Activity[] }>(`${API}/activities`, {
        signal: controller.signal,
      })
      .then((response) => {
        const now = Date.now();
        const upcoming = (response.data.activities || [])
          .filter(
            (item) => item.status === "published" || item.status === "approved",
          )
          .map((item) => ({ item, startsAt: getActivityStart(item) }))
          .filter(({ startsAt }) => Number.isFinite(startsAt) && startsAt >= now)
          .sort((first, second) => first.startsAt - second.startsAt);

        setActivity(upcoming[0]?.item ?? null);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        const message = axios.isAxiosError(requestError)
          ? requestError.response?.data?.message
          : undefined;
        setError(message || "Unable to load upcoming events.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="aicc-featured-event relative ek-reveal ek-delay-2">
      <div className="aicc-featured-frame rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
        <div className="aicc-featured-panel rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                {loading ? "Coming up" : activity ? "Next upcoming event" : "Coming up"}
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                {loading
                  ? "Finding your next event..."
                  : activity?.title || "No upcoming events"}
              </h2>
              {activity && (
                <p className="mt-2 text-sm font-medium text-indigo-200">
                  {activity.category}
                </p>
              )}
            </div>
            <div className="shrink-0 rounded-xl bg-white/10 p-2.5">
              <CalendarDays className="h-5 w-5 text-indigo-300" />
            </div>
          </div>

          {error ? (
            <p role="status" className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-slate-300">
              {error}
            </p>
          ) : activity ? (
            <>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <CalendarDays className="h-4 w-4 text-indigo-300" />
                  <p className="mt-2 text-xs text-slate-400">Date</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {formatActivityDate(activity.date)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                  <Clock3 className="h-4 w-4 text-indigo-300" />
                  <p className="mt-2 text-xs text-slate-400">Time</p>
                  <p className="mt-0.5 text-sm font-semibold">{activity.time}</p>
                </div>

                <div className="col-span-2 rounded-xl bg-white/5 p-3">
                  <MapPin className="h-4 w-4 text-indigo-300" />
                  <p className="mt-2 text-xs text-slate-400">Venue</p>
                  <p className="mt-0.5 text-sm font-semibold">{activity.venue}</p>
                </div>
              </div>

              <Link
                href={`/events/${activity._id}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold transition hover:bg-indigo-500"
              >
                View event
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {loading
                  ? "Loading published events..."
                  : "Check back soon for the next AICC event."}
              </p>
              {!loading && (
                <Link
                  href="/events"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold transition hover:bg-white/10"
                >
                  Browse events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
