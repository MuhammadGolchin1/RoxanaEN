import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/footer.css";

// The source site has a separate visual theme for its questionnaire.
// Load the same page-specific styles, then apply the English direction layer.
const route = window.location.pathname.split("/").filter(Boolean)[0] || "";
if (route === "questionnaire") {
  await import("./styles/questionnaire.css");
} else {
  await import("./styles/styles.css");
  if (!route) await import("./styles/welcome.css");
  else if (["about", "faq", "privacy", "contact"].includes(route))
    await import("./styles/information.css");
}
await import("./styles/english.css");
createRoot(document.getElementById("root")).render(<App />);
