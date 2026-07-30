import React from "react";
import { createRoot } from "react-dom/client";
import ParentApp from "./parent-app.js";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Demo mount failed: #root element not found");
}
createRoot(container).render(
  <React.StrictMode>
    <ParentApp />
  </React.StrictMode>
);
