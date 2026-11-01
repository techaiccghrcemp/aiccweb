import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ClubBrandingProvider, ClubLogo } from "./ClubBranding";
import RoleNavigation from "./RoleNavigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AICC Club | Artificial Intelligence & Coding",
  description: "Explore artificial intelligence and coding events with the AICC community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="flex min-h-full flex-col">
        <ClubBrandingProvider>
          <RoleNavigation>
            <div className="flex-1">{children}</div>
            <footer className="ek-fade-in border-t border-slate-200 bg-white/90 text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-400">
              <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
                <div>
                  <Link href="/" className="inline-flex items-center gap-3 text-slate-950 dark:text-white">
                    <ClubLogo className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />
                    <span className="text-lg font-extrabold">AICC Club</span>
                  </Link>
                  <p className="mt-4 max-w-sm text-sm leading-6">A community for students to explore AI, learn coding, and build projects together.</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Explore</p>
                  <div className="mt-4 flex flex-col gap-3 text-sm font-semibold"><Link href="/" className="hover:text-indigo-600">Home</Link><Link href="/#about" className="hover:text-indigo-600">About</Link><Link href="/events" className="hover:text-indigo-600">Events</Link><Link href="/announcements" className="hover:text-indigo-600">Announcements</Link><Link href="/login" className="hover:text-indigo-600">Sign in</Link></div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Your workspace</p>
                  <div className="mt-4 flex flex-col gap-3 text-sm font-semibold"><Link href="/dashboard" className="hover:text-indigo-600">Student portal</Link><Link href="/faculty" className="hover:text-indigo-600">Faculty portal</Link><Link href="/admin" className="hover:text-indigo-600">Admin portal</Link></div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© 2026 AICC Club. Artificial Intelligence & Coding Club.</span><span>Learn. Build. Connect.</span></div></div>
            </footer>
          </RoleNavigation>
        </ClubBrandingProvider>
      </body>
    </html>
  );
}
