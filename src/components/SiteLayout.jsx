import React from "react";
import SiteFooter from "./SiteFooter.jsx";
function SiteLayout({ children: children, assessment = false, home = false }) {
  return (
    <React.Fragment>
      <a className="skip" href="#main">
        Skip to main content
      </a>
      <header className={`topbar${home ? " topbar--hero" : ""}`}>
        <nav className="wrap nav" aria-label="Main navigation">
          <a className="brand" href="/" aria-label="Roxana, home page">
            <img
              className="brand-mark"
              src="/roxana-logo.png"
              alt=""
              aria-hidden="true"
            />
            <span className="brand-name">Roxana</span>
          </a>
          <div className="nav-links">
            <a className="nav-link--about" href="/#about">
              Discover Roxana
            </a>
            <a
              href="/assessment/"
              aria-current={assessment ? "page" : undefined}
            >
              Weight assessment
            </a>
            <a href="/questionnaire/">Lifestyle assessment &amp; your plan</a>
          </div>
          <a className="button secondary" href="/#start">
            Start assessment
          </a>
        </nav>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </React.Fragment>
  );
}
export default SiteLayout;
