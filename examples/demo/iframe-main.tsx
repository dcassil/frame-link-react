import React from "react";
import { createRoot } from "react-dom/client";
import IframeApp from "./iframe-app.js";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Demo mount failed: #root element not found");
}
createRoot(container).render(
  <React.StrictMode>
    <IframeApp />
  </React.StrictMode>
);
