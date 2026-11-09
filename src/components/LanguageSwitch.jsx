import { useLanguage } from "../i18n/LanguageContext.jsx";
export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();
  const target = language === "en" ? "fr" : "en";
  const label = t(target === "fr" ? "Switch to French" : "Switch to English");
  return (
    <button
      type="button"
      className="language-switch"
      aria-label={label}
      title={label}
      onClick={() => setLanguage(target)}
      data-testid="language-switch"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </svg>
      <span lang={target}>{target.toUpperCase()}</span>
    </button>
  );
}
