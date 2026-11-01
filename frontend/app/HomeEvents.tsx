"use client";

import axios from "axios";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
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

function getActivityDate(date: string) {
  const dateParts = date.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) return null;

  const [, yearPart, monthPart, dayPart] = dateParts;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  if (!year || !month || !day) return null;

  const parsedDate = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }
  return parsedDate;
}

function formatActivityDate(date: string) {
  const parsedDate = getActivityDate(date);
  if (!parsedDate) return "Date to be announced";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(parsedDate);
}

export default function HomeEvents() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void axios
      .get<{ activities: Activity[] }>(`${API}/activities`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (data.activities || [])
          .filter(
            (activity) =>
              activity.status === "published" || activity.status === "approved",
          )
          .map((activity) => ({
            activity,
            date: getActivityDate(activity.date),
          }))
          .filter(
            (entry): entry is { activity: Activity; date: Date } =>
              entry.date !== null && entry.date.getTime() >= today.getTime(),
          )
          .sort((first, second) => first.date.getTime() - second.date.getTime())
          .slice(0, 3)
          .map(({ activity }) => activity);

        setActivities(upcoming);
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
    <section
      id="events"
      className="aicc-events"
      aria-labelledby="events-heading"
    >
      <div className="aicc-section-shell">
        <div className="aicc-events-heading">
          <div>
            <p className="aicc-section-kicker">Make your next move</p>
            <h2 id="events-heading">
              Good things happen
              <br />
              <span>when you show up.</span>
            </h2>
          </div>
          <Link className="aicc-events-all" href="/events">
            Browse all events <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="aicc-events-grid" aria-label="Loading events">
            {[0, 1, 2].map((item) => (
              <div className="aicc-event-skeleton" key={item} />
            ))}
          </div>
        ) : error ? (
          <p className="aicc-events-message" role="status">
            {error}{" "}
            <Link href="/events">Browse the events page instead.</Link>
          </p>
        ) : activities.length === 0 ? (
          <div className="aicc-events-empty">
            <CalendarDays aria-hidden="true" />
            <div>
              <h3>Something new is on the way.</h3>
              <p>
                There are no upcoming events right now. Browse the calendar to
                see what the community has been up to.
              </p>
            </div>
            <Link href="/events" aria-label="Browse all AICC events">
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="aicc-events-grid">
            {activities.map((activity, index) => (
              <article className="aicc-event-card" key={activity._id}>
                <div className={`aicc-event-art aicc-event-art-${index + 1}`}>
                  <span className="aicc-event-category">{activity.category}</span>
                  <span className="aicc-event-date">
                    <span>{formatActivityDate(activity.date).split(" ")[1]}</span>
                    <strong>{formatActivityDate(activity.date).split(" ")[0]}</strong>
                  </span>
                  <span className="aicc-event-art-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <div className="aicc-event-info">
                  <h3>{activity.title}</h3>
                  <div className="aicc-event-meta">
                    <span>
                      <Clock3 aria-hidden="true" />
                      {activity.time}
                    </span>
                    <span>
                      <MapPin aria-hidden="true" />
                      {activity.venue}
                    </span>
                  </div>
                  <Link href={`/events/${activity._id}`}>
                    Event details <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
