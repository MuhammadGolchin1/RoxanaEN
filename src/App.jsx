import { useLanguage } from "./i18n/LanguageContext.jsx";
import { useEffect } from "react";
import { currentRoute, sitePath } from "./lib/paths.js";
import HomePage from "./pages/HomePage.jsx";
import AssessmentPage from "./pages/AssessmentPage.jsx";
import QuestionnairePage from "./pages/QuestionnairePage.jsx";
import {
  AboutContent,
  FaqContent,
  PrivacyContent,
} from "./pages/InformationPage.jsx";
import SiteLayout from "./components/SiteLayout.jsx";
import { INFORMATION_PAGES } from "./components/SiteFooter.jsx";
const information = {
  about: {
    Content: AboutContent,
    className: "about-page",
  },
  faq: {
    Content: FaqContent,
    className: "faq-page",
  },
  privacy: {
    Content: PrivacyContent,
    className: "privacy-page",
  },
  contact: {
    Content: () => null,
    className: "",
  },
};
export default function App() {
  const { t: tr } = useLanguage();
  const route = currentRoute();
  const title = INFORMATION_PAGES.find((page) => page.slug === route)?.title;
  useEffect(() => {
    document.title =
      route === "assessment"
        ? tr("Weight Assessment | Roxana")
        : route === "questionnaire"
          ? tr("Getting Started Questionnaire | Roxana")
          : title
            ? `${tr(title)} | Roxana`
            : tr("Roxana | Lifestyle & Fitness");
  }, [route, title, tr]);
  if (!route) return <HomePage />;
  if (route === "assessment") return <AssessmentPage />;
  if (route === "questionnaire") return <QuestionnairePage />;
  if (information[route]) {
    const { Content, className } = information[route];
    return (
      <SiteLayout>
        <section
          className={`wrap information-page ${className}`}
          aria-labelledby="information-title"
        >
          <h1 id="information-title">{tr(title)}</h1>
          <Content />
        </section>
      </SiteLayout>
    );
  }
  return (
    <SiteLayout>
      <section className="wrap information-page">
        <h1>{tr("Page not found")}</h1>
        <a className="button" href={sitePath("/")}>
          {tr("Back to home")}
        </a>
      </section>
    </SiteLayout>
  );
}
