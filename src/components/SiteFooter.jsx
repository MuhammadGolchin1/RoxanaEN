import React from "react";
const INFORMATION_PAGES = [
  {
    slug: "faq",
    title: "Frequently asked questions",
  },
  {
    slug: "about",
    title: "About us",
  },
  {
    slug: "contact",
    title: "Contact us",
  },
  {
    slug: "privacy",
    title: "Privacy policy",
  },
];
const SOCIAL_LINKS = [
  {
    name: "Telegram",
    icon: "telegram.png",
    href: "https://t.me/Roxanaa_Lifestyle",
  },
  {
    name: "Instagram",
    icon: "instagram.png",
    href: "https://www.instagram.com/Roxana.lifestyle/",
  },
  {
    name: "WhatsApp",
    icon: "whatsapp.png",
    href: "https://wa.me/989960764003",
  },
  {
    name: "Bale",
    icon: "bale.png",
    href: "https://ble.ir/Roxana_Lifestyle",
  },
];
function SiteFooter() {
  return (
    <footer className="site-footer" dir="ltr">
      <svg
        className="site-footer__icon-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="bale-icon-outline" clipPathUnits="objectBoundingBox">
            <path d="M .002 .06 C .002 .011 .047 -.021 .092 .01 L .208 .096 C .29 .035 .392 .002 .5 .002 C .775 .002 .998 .225 .998 .5 C .998 .775 .775 .998 .5 .998 C .225 .998 .002 .775 .002 .5 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <a
              className="site-footer__brand"
              href="/"
              aria-label="Roxana, home page"
            >
              <img src="/roxana-logo.png" width="64" height="64" alt="" />
              <span>
                <strong>Roxana</strong>
                <span>Lifestyle &amp; Fitness</span>
              </span>
            </a>
            <p className="site-footer__tagline">Your well-being starts here</p>
          </div>
          <nav className="site-footer__nav" aria-label="Footer links">
            <h2 className="site-footer__heading">Explore Roxana</h2>
            <ul>
              {INFORMATION_PAGES.filter(({ slug: O }) => O !== "contact").map(
                ({ slug: O, title: sl }) => (
                  <li key={O}>
                    <a href={`/${O}/`}>{sl}</a>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="site-footer__contact">
            <h2 className="site-footer__heading">Let's stay in touch</h2>
            <a
              className="site-footer__email"
              href="mailto:Roxanaa.lifestyle@gmail.com"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <bdi>Roxanaa.lifestyle@gmail.com</bdi>
            </a>
            <ul
              className="site-footer__socials"
              aria-label="Roxana social media"
            >
              {SOCIAL_LINKS.map(({ name: O, icon: sl, href: fl }) => (
                <li key={sl}>
                  <a
                    className="site-footer__social"
                    href={fl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${O} Roxana (opens in a new tab)`}
                  >
                    <img
                      src={`/social/${sl}`}
                      width="32"
                      height="32"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>© Roxana. All rights reserved.</p>
          <a href="#top">
            {"Back to top "}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
export { INFORMATION_PAGES };
export default SiteFooter;
