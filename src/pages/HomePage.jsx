import React, { useState, useEffect } from "react";
import SiteLayout from "../components/SiteLayout.jsx";
function HeroVideo() {
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const poster = "/roxana-hero-poster.webp";
  useEffect(() => {
    if (!posterLoaded) return;
    const s = window.matchMedia("(prefers-reduced-motion: reduce)");
    const m = navigator.connection;
    let d;
    function n() {
      window.clearTimeout(d);
      setIsPlaying(false);
      setLoadVideo(false);
      !s.matches &&
        !m?.saveData &&
        (d = window.setTimeout(() => setLoadVideo(true), 200));
    }
    n();
    s.addEventListener("change", n);
    m?.addEventListener("change", n);
    return () => {
      window.clearTimeout(d);
      s.removeEventListener("change", n);
      m?.removeEventListener("change", n);
    };
  }, [posterLoaded]);
  return (
    <div className="hero-video" aria-hidden="true" data-playing={isPlaying}>
      <div className="hero-video__media">
        <img
          src={poster}
          width="1600"
          height="900"
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onLoad={() => setPosterLoaded(true)}
          onError={() => setPosterLoaded(true)}
        />
        {loadVideo && !videoFailed && (
          <video
            src="/roxana-hero-background.mp4"
            poster={poster}
            width="1920"
            height="1080"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            preload="none"
            tabIndex={-1}
            onPlaying={() => setIsPlaying(true)}
            onError={() => {
              setIsPlaying(false);
              setVideoFailed(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
function HomeContent() {
  return (
    <SiteLayout home={true}>
      <section className="hero hero--video" aria-labelledby="hero-title">
        <HeroVideo />
        <div className="wrap">
          <div className="hero-copy">
            <p className="eyebrow">Roxana · Lifestyle &amp; Fitness</p>
            <h1 id="hero-title">Live a better version of yourself!</h1>
            <p>
              On Roxana's Instagram, discover short home workouts, simple
              healthy meals and corrective exercises. Want to know whether your
              BMI is in the initial assessment range for weight-loss injections?
              Start with our assessment.
            </p>
          </div>
        </div>
      </section>
      <section className="topics" id="about" aria-labelledby="about-title">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">Discover Roxana</p>
            <h2 id="about-title">What will you find at Roxana?</h2>
          </div>
          <div className="topic-grid">
            <article className="topic">
              <span className="topic-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10h16c0 5-3 8-8 8s-8-3-8-8Zm4 11h8M9 7c0-2 2-2 2-4m3 4c0-2 2-2 2-4" />
                </svg>
              </span>
              <div>
                <h3>Simple, healthy meals</h3>
                <p>
                  From protein-packed breakfasts to satisfying snacks, made with
                  ingredients that are easy to find.
                </p>
              </div>
            </article>
            <article className="topic">
              <span className="topic-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 7v10m10-10v10M4 9v6m16-6v6M7 12h10M2 12h2m16 0h2" />
                </svg>
              </span>
              <div>
                <h3>Home workouts &amp; challenges</h3>
                <p>
                  Short workouts and follow-along videos for the days you don't
                  have time to get to the gym.
                </p>
              </div>
            </article>
            <article className="topic">
              <span className="topic-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="4" r="2" />
                  <path d="m4 9 8 2 8-2m-8 2v5m0 0-4 5m4-5 4 5" />
                </svg>
              </span>
              <div>
                <h3>Corrective exercises</h3>
                <p>
                  Movement and posture guidance, with a focus on lower-back
                  posture, rounded shoulders and joint health.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section
        className="wrap services"
        id="start"
        aria-labelledby="services-title"
      >
        <h2 id="services-title">Where should I start?</h2>
        <div className="service-grid">
          <a
            className="service-card"
            href="/assessment/"
            aria-labelledby="assessment-link-title"
          >
            <span className="service-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="3" width="16" height="18" rx="3" />
                <path d="M8 7h8m-8 5h2m4 0h2m-8 4h2m4 0h2" />
              </svg>
            </span>
            <div>
              <h3 id="assessment-link-title">
                Weight-loss injection assessment
              </h3>
              <p>
                Enter your height and weight to calculate your BMI and take an
                initial assessment for weight-loss injections, with guidance
                from doctors and specialists.
              </p>
            </div>
          </a>
          <a
            className="service-card"
            href="/questionnaire/"
            aria-labelledby="coaching-link-title"
          >
            <span className="service-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                <path d="M4 12h4l2-4 4 8 2-4h4" />
              </svg>
            </span>
            <div>
              <h3 id="coaching-link-title">Get fit by Nowruz!</h3>
              <p>
                Tell us about your health, nutrition and activity so the Roxana
                team can get to know you and help you take your first steps.
              </p>
            </div>
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
const WELCOME_DURATION = 2e3;
function WelcomeScreen({ children: children }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!visible) return;
    const l = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const o = window.setTimeout(() => setVisible(false), WELCOME_DURATION);
    return () => {
      window.clearTimeout(o);
      document.body.style.overflow = l;
    };
  }, [visible]);
  return (
    <React.Fragment>
      {visible && (
        <div
          className="welcome-screen"
          role="status"
          dir="ltr"
          style={{
            "--intro-duration": `${WELCOME_DURATION}ms`,
          }}
        >
          <div className="welcome-screen__content">
            <div className="welcome-screen__art" aria-hidden="true">
              <span className="welcome-screen__halo" />
              <svg
                className="welcome-screen__logo"
                viewBox="192 64 912 1176"
                fill="none"
              >
                <image href="/roxana-logo.png" width="1254" height="1254" />
              </svg>
            </div>
            <p className="welcome-screen__message">
              Your well-being starts here
            </p>
            <span className="welcome-screen__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}
      <div inert={visible} aria-hidden={visible || undefined}>
        {children}
      </div>
    </React.Fragment>
  );
}
export default function HomePage() {
  return (
    <WelcomeScreen>
      <HomeContent />
    </WelcomeScreen>
  );
}
