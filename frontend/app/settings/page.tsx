"use client";

import { ArrowLeft, Bell, CheckCircle2, LogOut, Moon, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubLogoSettings from "../admin/settings/ClubLogoSettings";
import { ClubLogo } from "../ClubBranding";

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [compact, setCompact] = useState(false);
  const [saved, setSaved] = useState(false);
  const [home, setHome] = useState("/dashboard");
  const [adminToken, setAdminToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    const user = localStorage.getItem("user");
    const role = user ? JSON.parse(user).role : "student";
    setAdminToken(token);
    setIsAdmin(role === "admin");
    setHome(role === "faculty" ? "/faculty" : role === "admin" ? "/admin" : "/dashboard");
    setNotifications(localStorage.getItem("aicc.notifications") !== "false");
    setCompact(localStorage.getItem("aicc.compact") === "true");
  }, [router]);

  useEffect(() => {
    if (isAdmin && window.location.hash === "#club-logo") {
      document.getElementById("club-logo")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAdmin]);

  const save = () => {
    localStorage.setItem("aicc.notifications", String(notifications));
    localStorage.setItem("aicc.compact", String(compact));
    localStorage.setItem("aicc.theme", "dark");
    document.documentElement.classList.add("dark");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.replace("/login"); };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Link href={home} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to portal</Link>
          <div className="flex items-center gap-3"><ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white" fallback="AICC" /><span className="font-extrabold">Settings</span></div>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Workspace preferences</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Settings</h1>
        <p className="mt-4 leading-7 text-slate-500">Tune how AICC Club keeps you informed and displays your workspace.</p>
        {isAdmin && <ClubLogoSettings token={adminToken} />}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <SettingRow icon={<Bell />} title="Campus notifications" description="Show announcements and activity updates in your workspace." enabled={notifications} onChange={setNotifications} />
          <SettingRow icon={<SlidersHorizontal />} title="Compact workspace" description="Use tighter spacing when scanning activity lists and records." enabled={compact} onChange={setCompact} />
          <div className="flex flex-col gap-5 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><Moon className="mt-0.5 h-5 w-5 text-orange-400" /><div><p className="font-bold">Appearance</p><p className="mt-1 text-sm leading-6 text-slate-500">AICC’s official black and orange palette is applied across every workspace.</p></div></div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-400"><span className="h-2 w-2 rounded-full bg-orange-500" /> Black &amp; orange</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><button onClick={logout} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600"><LogOut className="h-4 w-4" /> Sign out</button><div className="flex items-center gap-4"><button onClick={save} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">Save preferences</button>{saved && <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved</span>}</div></div>
      </section>
    </main>
  );
}

function SettingRow({ icon, title, description, enabled, onChange }: { icon: React.ReactNode; title: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-5 border-b border-slate-100 p-6"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div><button type="button" aria-label={`Toggle ${title}`} aria-pressed={enabled} onClick={() => onChange(!enabled)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} /></button></div>;
}
