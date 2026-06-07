import React from "react";
import { createRoot } from "react-dom/client";
import { SystemProvider } from "./SystemContext";
import App from "./App";
import "./styles/styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
root.render(
  <SystemProvider>
    <App />
  </SystemProvider>
);
