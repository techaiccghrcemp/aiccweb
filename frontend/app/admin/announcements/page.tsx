"use client";

import axios from "axios";
import { ArrowLeft, Bell, CalendarDays, Megaphone, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Audience = "all" | "students" | "faculty";
type Announcement = { _id: string; title: string; message: string; audience: Audience; createdAt: string };
type RecordsResponse = { announcements?: Announcement[] };
type AnnouncementForm = { title: string; message: string; audience: Audience };

const audienceLabels: Record<Audience, string> = { all: "Everyone", students: "Students", faculty: "Faculty" };

export default function AnnouncementsPage() {
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [query, setQuery] = useState("");
	const [audience, setAudience] = useState<"all" | Audience>("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [form, setForm] = useState<AnnouncementForm>({ title: "", message: "", audience: "all" });
	const [editing, setEditing] = useState<Announcement | null>(null);
	const [saving, setSaving] = useState(false);
	const [showComposer, setShowComposer] = useState(false);
	const token = typeof window === "undefined" ? "" : localStorage.getItem("token") || "";
	const headers = { Authorization: `Bearer ${token}` };
 
	const loadAnnouncements = async () => {
		const response = await axios.get<RecordsResponse>("http://localhost:5000/api/admin/records", { headers });
		setAnnouncements(response.data.announcements || []);
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) { window.location.href = "/login"; return; }
		loadAnnouncements()
			.catch(() => setError("We could not load the announcement centre."))
			.finally(() => setLoading(false));
	}, []);

	const saveAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true); setError("");
		try {
			if (editing) await axios.patch(`http://localhost:5000/api/announcements/${editing._id}`, form, { headers });
			else await axios.post("http://localhost:5000/api/announcements", form, { headers });
			setForm({ title: "", message: "", audience: "all" }); setEditing(null); setShowComposer(false); await loadAnnouncements();
		} catch (requestError: unknown) {
			setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to save announcement." : "Unable to save announcement.");
		} finally { setSaving(false); }
	};

	const deleteAnnouncement = async (announcement: Announcement) => {
		if (!window.confirm(`Delete “${announcement.title}”?`)) return;
		try { await axios.delete(`http://localhost:5000/api/announcements/${announcement._id}`, { headers }); await loadAnnouncements(); }
		catch (requestError: unknown) { setError(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to delete announcement." : "Unable to delete announcement."); }
	};

	const startEditing = (announcement: Announcement) => {
		setEditing(announcement); setForm({ title: announcement.title, message: announcement.message, audience: announcement.audience }); setShowComposer(true);
	};

	const filteredAnnouncements = useMemo(() => announcements.filter((item) => {
		const matchesAudience = audience === "all" || item.audience === audience;
		const searchableText = `${item.title} ${item.message} ${item.audience}`.toLowerCase();
		return matchesAudience && searchableText.includes(query.toLowerCase());
	}), [announcements, audience, query]);
	const metrics = [
		{ label: "Total updates", value: announcements.length, Icon: Bell },
		{ label: "For students", value: announcements.filter((item) => item.audience === "students").length, Icon: Users },
		{ label: "For faculty", value: announcements.filter((item) => item.audience === "faculty").length, Icon: Megaphone },
	];

	return (
		<main className="min-h-screen bg-[#f6f7fb] px-5 py-6 text-slate-950 sm:px-8 sm:py-8">
			<div className="mx-auto max-w-7xl">
				<header className="flex items-center justify-between">
					<Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600">
						<ArrowLeft className="h-4 w-4" /> Admin control center
					</Link>
					<div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 sm:flex">
						<Megaphone className="h-4 w-4 text-indigo-500" /> Communication hub
					</div>
				</header>

				<section className="relative mt-8 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-11">
					<div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-indigo-500/20" />
					<div className="relative max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Campus communication</p>
						<h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Announcements</h1>
						<p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">Keep students and faculty aligned with timely updates, reminders, and important campus news.</p>
						<button type="button" onClick={() => { setEditing(null); setForm({ title: "", message: "", audience: "all" }); setShowComposer(true); }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-indigo-400">
							<Plus className="h-4 w-4" /> Publish announcement
						</button>
					</div>
				</section>

				{showComposer && <section className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{editing ? "Edit update" : "New update"}</p><h2 className="mt-1 text-xl font-black">{editing ? "Update announcement" : "Publish announcement"}</h2></div><button type="button" onClick={() => setShowComposer(false)} aria-label="Close announcement form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button></div>
					<form onSubmit={saveAnnouncement} className="mt-5 grid gap-4 sm:grid-cols-2">
						<label className="text-sm font-bold text-slate-700">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></label>
						<label className="text-sm font-bold text-slate-700">Audience<select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as Audience })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"><option value="all">Everyone</option><option value="students">Students</option><option value="faculty">Faculty</option></select></label>
						<label className="text-sm font-bold text-slate-700 sm:col-span-2">Message<textarea required rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></label>
						<button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2">{saving ? "Saving..." : editing ? "Save changes" : "Publish announcement"}</button>
					</form>
				</section>}

				<section className="mt-6 grid gap-4 sm:grid-cols-3">
					{metrics.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{label}</p><Icon className="h-4 w-4 text-indigo-500" /></div><p className="mt-3 text-3xl font-black text-slate-900">{value}</p></div>)}
				</section>

				<section className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h2 className="text-xl font-black tracking-tight">Recent updates</h2>
						<p className="mt-1 text-sm text-slate-500">Browse and find the right message at a glance.</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<label className="flex min-w-64 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
							<Search className="h-4 w-4 text-slate-400" />
							<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search updates" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
						</label>
						<div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
							{(["all", "students", "faculty"] as const).map((item) => <button key={item} onClick={() => setAudience(item)} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${audience === item ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{item === "all" ? "All" : audienceLabels[item]}</button>)}
						</div>
					</div>
				</section>

				{error && <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
				{loading && <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">Loading announcement centre...</div>}
				{!loading && !error && filteredAnnouncements.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm"><Bell className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-bold text-slate-800">No announcements found</h3><p className="mt-1 text-sm text-slate-500">Try another audience or search term.</p></div>}
				{!loading && filteredAnnouncements.length > 0 && <div className="mt-6 grid gap-4 lg:grid-cols-2">{filteredAnnouncements.map((item) => <article key={item._id} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5"><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{audienceLabels[item.audience]}</span><span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div><h3 className="mt-5 text-lg font-black text-slate-900">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p><div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => startEditing(item)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"><Pencil className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => deleteAnnouncement(item)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div></article>)}</div>}
			</div>
		</main>
	);
}
