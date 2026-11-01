"use client";

import axios from "axios";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubLogo } from "../ClubBranding";

type Activity = { _id: string; title: string };
type Registration = { _id: string; activity: Activity | null };

export default function FeedbackPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activityId, setActivityId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.replace("/login"); return; }
      try { const response = await axios.get("http://localhost:5000/api/registrations/my", { headers: { Authorization: `Bearer ${token}` } }); setRegistrations(response.data.registrations || []); }
      catch (requestError: unknown) { if (axios.isAxiosError(requestError) && requestError.response?.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); router.replace("/login"); return; } setError("Unable to load your registered activities."); }
      finally { setLoading(false); }
    };
    fetchRegistrations();
  }, [router]);

  const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setSubmitting(true); setError(""); setMessage("");
    try { const response = await axios.post("http://localhost:5000/api/feedback", { activityId, rating, comment }, { headers: { Authorization: `Bearer ${token}` } }); setMessage(response.data.message); setComment(""); }
    catch (requestError: unknown) { setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to submit feedback." : "Unable to submit feedback."); }
    finally { setSubmitting(false); }
  };

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" /><span className="font-extrabold">AICC Club</span></div></div></header><section className="mx-auto max-w-2xl px-5 py-10 sm:px-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><MessageSquare className="h-6 w-6" /></div><p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Your voice</p><h1 className="mt-3 text-4xl font-black tracking-tight">Share feedback</h1><p className="mt-4 leading-7 text-slate-500">Tell us how your campus activity experience went.</p>{error && <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}{message && <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}{!loading && registrations.filter((registration) => registration.activity).length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Register for an activity before submitting feedback.</div> : <form onSubmit={submitFeedback} className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><label className="block text-sm font-bold text-slate-700">Activity<select required value={activityId} onChange={(event) => setActivityId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"><option value="">Select a registered activity</option>{registrations.map((registration) => registration.activity && <option key={registration._id} value={registration.activity._id}>{registration.activity.title}</option>)}</select></label><div className="mt-6"><p className="text-sm font-bold text-slate-700">Rating</p><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`rounded-lg p-2 ${value <= rating ? "text-amber-500" : "text-slate-300"}`} aria-label={`${value} out of 5`}><span className="text-sm font-bold">{value}</span></button>)}</div></div><label className="mt-6 block text-sm font-bold text-slate-700">Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={5} placeholder="What did you think?" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500" /></label><button type="submit" disabled={submitting || loading} className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting..." : "Submit feedback"}</button></form>}</section></main>;
}
