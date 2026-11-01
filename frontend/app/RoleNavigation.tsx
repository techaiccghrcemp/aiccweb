'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClubLogo } from './ClubBranding';

type Role = 'student' | 'faculty' | 'admin';
type NavItem = { label: string; href: string };

const navigation: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore events', href: '/events' },
    { label: 'My activities', href: '/my-activities' },
    { label: 'Attendance', href: '/attendance' },
    { label: 'Announcements', href: '/announcements' },
    { label: 'Feedback', href: '/feedback' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ],
  faculty: [
    { label: 'Dashboard', href: '/faculty' },
    { label: 'Activities', href: '/faculty/activities' },
    { label: 'Registrations', href: '/faculty/registrations' },
    { label: 'Attendance', href: '/faculty/attendance' },
    { label: 'Announcements & feedback', href: '/manage' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Students', href: '/admin/students' },
    { label: 'Faculty', href: '/admin/faculty' },
    { label: 'Activities', href: '/admin/activities' },
    { label: 'Registrations', href: '/admin/registrations' },
    { label: 'Attendance', href: '/admin/attendance' },
    { label: 'Announcements', href: '/admin/announcements' },
    { label: 'Feedback', href: '/admin/feedback' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Team', href: '/admin#team-members' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Club branding', href: '/admin/settings#club-logo' },
  ],
};

export default function RoleNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [desktopVisible, setDesktopVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedRole = storedUser ? JSON.parse(storedUser).role : null;
      setRole(storedRole === 'student' || storedRole === 'faculty' || storedRole === 'admin' ? storedRole : null);
    } catch {
      setRole(null);
    }
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const updateViewport = () => setIsDesktop(media.matches);
    updateViewport();
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  if (!role || isPublicPage) return <div className="flex min-h-full flex-col">{children}</div>;

  const items = navigation[role];
  const isActive = (href: string) => {
    const route = href.split('#', 1)[0];
    return pathname === route || pathname.startsWith(`${route}/`);
  };

  const toggleNavigation = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setDesktopVisible((visible) => !visible);
    } else {
      setMobileOpen((open) => !open);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setRole(null);
    router.replace('/login');
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-[100] flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/95 px-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <button
          type="button"
          onClick={toggleNavigation}
          aria-label="Toggle navigation menu"
          aria-controls="role-navigation"
          aria-expanded={isDesktop ? desktopVisible : mobileOpen}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href={role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/dashboard'} className="flex items-center gap-3 font-extrabold text-slate-950 dark:text-white">
          <ClubLogo className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-[9px] font-black tracking-tight text-white" fallback="AICC" />
          <span>AICC Club</span>
        </Link>
        <span className="hidden text-xs font-bold uppercase tracking-widest text-slate-400 sm:inline">{role} portal</span>
        <button
          type="button"
          onClick={signOut}
          className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </header>

      {mobileOpen && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-40 cursor-default bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        id="role-navigation"
        aria-label={`${role} navigation`}
        aria-hidden={isDesktop ? !desktopVisible : !mobileOpen}
        inert={isDesktop ? !desktopVisible : !mobileOpen}
        className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[248px] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:top-16 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${desktopVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" onClick={() => setMobileOpen(false)}>
          {items.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive(href) ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div data-role={role} className={`role-nav-content min-h-0 flex-1 transition-[margin] duration-300 ${desktopVisible ? 'lg:ml-[248px]' : 'role-nav-content--wide'}`}>
        {children}
      </div>
    </div>
  );
}
