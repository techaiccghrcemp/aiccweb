"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClubLogo } from "./ClubBranding";

export default function PublicNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 20);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`aicc-header${scrolled ? " is-scrolled" : ""}`}>
      <nav className="aicc-nav" aria-label="Main navigation">
        <Link href="/" className="aicc-brand" aria-label="AICC Club home">
          <ClubLogo className="aicc-brand-mark" />
          <span className="aicc-brand-name">
            AICC <span>CLUB</span>
          </span>
        </Link>

        <div className="aicc-nav-links">
          <a href="#community">The club</a>
          <a href="#events">Events</a>
          <a href="#about">Our people</a>
        </div>

        <div className="aicc-nav-actions">
          <Link href="/login" className="aicc-login-link">
            Sign in
          </Link>
          <Link href="/register" className="aicc-nav-cta">
            Join the club <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="aicc-mobile-menu">
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="aicc-mobile-panel"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="aicc-mobile-panel" id="aicc-mobile-panel">
              <a href="#community" onClick={closeMenu}>
                The club
              </a>
              <a href="#events" onClick={closeMenu}>
                Events
              </a>
              <a href="#about" onClick={closeMenu}>
                Our people
              </a>
              <Link href="/login" onClick={closeMenu}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="aicc-mobile-cta"
                onClick={closeMenu}
              >
                Join the club <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
