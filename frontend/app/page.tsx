import {
  ArrowDown,
  ArrowRight,
  Braces,
  Lightbulb,
  Orbit,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import AboutTeamSection from "./AboutTeamSection";
import FeaturedEvent from "./FeaturedEvent";
import HomeEvents from "./HomeEvents";
import PublicNavigation from "./PublicNavigation";

const pathways = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Learn by doing",
    description:
      "Get hands-on with the ideas, tools, and techniques shaping what comes next.",
  },
  {
    icon: Braces,
    number: "02",
    title: "Make it real",
    description:
      "Turn a curious question into a prototype, a project, or something entirely new.",
  },
  {
    icon: Orbit,
    number: "03",
    title: "Find your people",
    description:
      "Meet students who are just as excited to experiment, collaborate, and share.",
  },
];

export default function Home() {
  return (
    <main className="ek-landing">
      <PublicNavigation />

      <section className="aicc-hero" aria-labelledby="hero-heading">
        <div className="aicc-hero-grid" aria-hidden="true" />
        <div className="aicc-hero-glow aicc-hero-glow-one" aria-hidden="true" />
        <div className="aicc-hero-glow aicc-hero-glow-two" aria-hidden="true" />

        <div className="aicc-hero-content">
          <div className="aicc-hero-copy">
            <p className="aicc-eyebrow">
              <span className="aicc-live-dot" />
              Artificial Intelligence &amp; Coding Club
            </p>
            <h1 id="hero-heading">
              Curiosity is
              <br />
              <span>the starting point.</span>
            </h1>
            <p className="aicc-hero-description">
              A campus community for people who want to understand AI, get
              hands-on with code, and build things that matter.
            </p>
            <div className="aicc-hero-actions">
              <a className="aicc-button aicc-button-primary" href="#events">
                Explore events <ArrowRight aria-hidden="true" />
              </a>
              <Link className="aicc-button aicc-button-quiet" href="/register">
                Join AICC Club <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="aicc-hero-note">
              <span className="aicc-note-line" />
              <span>Learn something. Make something. Meet your people.</span>
            </div>
          </div>

          <div className="aicc-hero-visual">
            <div className="aicc-visual-label">
              <Sparkles aria-hidden="true" />
              <span>Ideas in motion</span>
            </div>
            <div className="aicc-orbit-art" aria-hidden="true">
              <div className="aicc-orbit aicc-orbit-outer" />
              <div className="aicc-orbit aicc-orbit-middle" />
              <div className="aicc-orbit aicc-orbit-inner" />
              <div className="aicc-orbit-core">
                <span>A</span>
                <i />
              </div>
              <span className="aicc-orbit-node aicc-orbit-node-one" />
              <span className="aicc-orbit-node aicc-orbit-node-two" />
              <span className="aicc-orbit-node aicc-orbit-node-three" />
              <span className="aicc-orbit-caption">AI <b>×</b> CODE</span>
            </div>
            <div className="aicc-visual-footnote">
              <span>THE FUTURE IS BUILT TOGETHER</span>
              <span className="aicc-footnote-mark">↘</span>
            </div>
            <FeaturedEvent />
          </div>
        </div>

        <a className="aicc-scroll-cue" href="#community">
          <span>Scroll to explore</span>
          <ArrowDown aria-hidden="true" />
        </a>
      </section>

      <section
        id="community"
        className="aicc-community"
        aria-labelledby="community-heading"
      >
        <div className="aicc-section-shell">
          <div className="aicc-community-intro">
            <p className="aicc-section-kicker">More than a club</p>
            <h2 id="community-heading">
              A place to go from
              <br />
              <span>“what if?” to “what’s next?”</span>
            </h2>
            <p className="aicc-community-lede">
              AICC brings together students at every stage of their journey.
              Start with a question, find a workshop, and see where your next
              idea takes you.
            </p>
          </div>

          <div className="aicc-pathways">
            {pathways.map(({ icon: Icon, number, title, description }) => (
              <article className="aicc-pathway" key={number}>
                <div className="aicc-pathway-top">
                  <span className="aicc-pathway-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="aicc-pathway-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="aicc-pathway-rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeEvents />

      <AboutTeamSection />
    </main>
  );
}
