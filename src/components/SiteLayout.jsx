import { useLanguage } from "../i18n/LanguageContext.jsx";
import React from "react";
import { sitePath } from "../lib/paths.js";
import SiteFooter from "./SiteFooter.jsx";
import LanguageSwitch from "./LanguageSwitch.jsx";
function SiteLayout({ children: children, assessment = false, home = false }) {
  const { t: tr } = useLanguage();
  return (
    <React.Fragment>
      <a className="skip" href="#main">
        {tr("Skip to main content")}
      </a>
      <header className={`topbar${home ? " topbar--hero" : ""}`}>
        <nav className="wrap nav" aria-label={tr("Main navigation")}>
          <a
            className="brand"
            href={sitePath("/")}
            aria-label={tr("Roxana, home page")}
          >
            <img
              className="brand-mark"
              src={sitePath("/roxana-logo.png")}
              alt=""
              aria-hidden="true"
            />
            <span className="brand-name">{tr("Roxana")}</span>
          </a>
          <div className="nav-links">
            <a className="nav-link--about" href={sitePath("/#about")}>
              {tr("Discover Roxana")}
            </a>
            <a
              href={sitePath("/assessment/")}
              aria-current={assessment ? "page" : undefined}
            >
              {tr("Weight assessment")}
            </a>
            <a href={sitePath("/questionnaire/")}>
              {tr("Lifestyle assessment & your plan")}
            </a>
          </div>
          <div className="header-controls">
            <LanguageSwitch />
            <a className="button secondary" href={sitePath("/#start")}>
              {tr("Start assessment")}
            </a>
          </div>
        </nav>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </React.Fragment>
  );
}
export default SiteLayout;
