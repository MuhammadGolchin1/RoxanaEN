import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import { currentRoute } from "./lib/paths.js";
import "./styles/footer.css";

// The source site has a separate visual theme for its questionnaire.
// Load the same page-specific styles, then apply the English direction layer.
const route = currentRoute();
if (route === "questionnaire") {
  await import("./styles/questionnaire.css");
} else {
  await import("./styles/styles.css");
  if (!route) await import("./styles/welcome.css");
  else if (["about", "faq", "privacy", "contact"].includes(route))
    await import("./styles/information.css");
}
await import("./styles/english.css");
await import("./styles/language.css");
createRoot(document.getElementById("root")).render(<LanguageProvider><App /></LanguageProvider>);
