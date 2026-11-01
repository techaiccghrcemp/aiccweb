"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type TeamMember = {
  _id: string;
  name: string;
  position: string;
  photoUrl: string;
};

const API = "http://localhost:5000/api";
const gradients = [
  "from-indigo-500 via-violet-500 to-fuchsia-400",
  "from-sky-500 via-cyan-500 to-teal-400",
  "from-rose-500 via-orange-400 to-amber-300",
  "from-emerald-500 via-teal-500 to-cyan-400",
];

export default function AboutTeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");

  useEffect(() => {
    const section = sectionRef.current;
    let observer: IntersectionObserver | undefined;
    if (section && typeof IntersectionObserver !== "undefined") {
      section.classList.add("has-reveal");
      const reveals = section.querySelectorAll<HTMLElement>(".ek-about-reveal");
      observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) return;
            entry.target.style.transitionDelay = "0ms";
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
      );
      reveals.forEach((element) => observer?.observe(element));
    }

    return () => observer?.disconnect();
  }, [teamMembers]);

  useEffect(() => {
    const controller = new AbortController();
    void axios
      .get<{ members: TeamMember[] }>(`${API}/team`, { signal: controller.signal })
      .then((response) => setTeamMembers(response.data.members))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        setMembersError(message || "Team profiles are unavailable right now.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setMembersLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="ek-about-section relative isolate scroll-mt-20 overflow-hidden border-y border-slate-200 px-4 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="ek-about-glow ek-about-glow-one" aria-hidden="true" />
      <div className="ek-about-glow ek-about-glow-two" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-12">
          <div className="ek-about-reveal">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm backdrop-blur sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              The people behind AICC
            </p>
            <h2
              id="about-heading"
              className="mt-5 max-w-2xl text-[2.4rem] font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Big ideas start with{" "}
              <span className="ek-about-gradient-text">great people.</span>
            </h2>
          </div>

          <div className="ek-about-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:pb-1">
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Meet the curious minds learning, creating, and bringing students
              together through AI and code.
            </p>
            <div className="ek-team-count inline-flex w-full shrink-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-lg shadow-indigo-950/[0.04] backdrop-blur sm:w-auto">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-600/25">
                {membersLoading ? "…" : teamMembers.length}
              </span>
              <span>
                <span className="block text-sm font-extrabold text-slate-900">
                  Team members
                </span>
                <span className="block text-xs text-slate-500">
                  One AICC community
                </span>
              </span>
              <span className="ml-auto flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-100 sm:ml-1" />
            </div>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {membersLoading ? (
            <p className="col-span-full rounded-2xl border border-white/80 bg-white/70 px-5 py-8 text-center text-sm font-medium text-slate-500">
              Loading the AICC team...
            </p>
          ) : membersError ? (
            <p role="status" className="col-span-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center text-sm font-medium text-amber-800">
              {membersError}
            </p>
          ) : teamMembers.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-white/80 bg-white/70 px-5 py-8 text-center text-sm font-medium text-slate-500">
              Team profiles are coming soon.
            </p>
          ) : teamMembers.map((member, index) => (
            <article
              key={member._id}
              className="ek-about-reveal ek-team-card group min-w-0 rounded-[1.2rem] border border-white/80 bg-white/90 p-2.5 shadow-lg shadow-slate-900/[0.045] backdrop-blur-sm sm:rounded-[1.5rem] sm:p-3"
              style={{ transitionDelay: `${(index % 10) * 55}ms` }}
            >
              <div
                className={`ek-team-portrait relative flex aspect-[0.9] items-center justify-center overflow-hidden rounded-[0.9rem] bg-gradient-to-br ${gradients[index % gradients.length]} sm:aspect-[0.92] sm:rounded-[1.15rem]`}
              >
                <span className="ek-orbit ek-orbit-one z-10" aria-hidden="true" />
                <span className="ek-orbit ek-orbit-two z-10" aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 z-20 rounded-full border border-white/30 bg-slate-950/10 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-white backdrop-blur-md sm:right-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Image
                  src={`${API.replace(/\/api$/, "")}${member.photoUrl}`}
                  alt={`${member.name}, ${member.position}`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1280px) 30vw, 220px"
                  unoptimized
                  className="z-0 object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              </div>
              <div className="px-0.5 pb-1 pt-3 sm:px-1 sm:pt-4">
                <h3 className="truncate text-[13px] font-extrabold text-slate-950 sm:text-base">
                  {member.name}
                </h3>
                <p className="mt-1 truncate text-[11px] font-medium text-slate-500 sm:text-sm">
                  {member.position}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="ek-about-reveal ek-team-cta relative mt-10 overflow-hidden rounded-[1.6rem] bg-slate-950 px-5 py-10 text-center shadow-2xl shadow-indigo-950/15 sm:mt-14 sm:rounded-[2rem] sm:px-12 sm:py-14">
          <div className="ek-cta-glow ek-cta-glow-one" aria-hidden="true" />
          <div className="ek-cta-glow ek-cta-glow-two" aria-hidden="true" />
          <div className="relative">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-300 sm:text-xs">
              Your next chapter starts here
            </p>
            <h3 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight text-white sm:mt-4 sm:text-4xl">
              Make something meaningful with us.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
              Join activities, meet people, and turn your curiosity into
              something real.
            </p>
            <a
              href="/register"
              className="ek-cta-button mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-slate-950 shadow-xl shadow-black/15 sm:mt-8"
            >
              Join AICC Club
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
