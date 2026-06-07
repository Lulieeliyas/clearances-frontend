import React, { createContext, useEffect, useState } from "react";
import { apiFetch } from "../src/utils/api";

export const SystemContext = createContext();

export function SystemProvider({ children }) {
  const [system, setSystem] = useState(null);

  // ---------------- LOAD SYSTEM ----------------
  const loadSystem = async () => {
    try {
      // ✅ FIXED ENDPOINT (added "s")
      const data = await apiFetch("system-controls/");

      if (Array.isArray(data) && data.length) {
        setSystem(data[0]);
      }
    } catch (err) {
      console.error("Failed to load system:", err);
    }
  };

  // ---------------- UPDATE SYSTEM ----------------
  const updateSystem = async (payload) => {
    if (!system) return;

    try {
      // ✅ FIXED ENDPOINT (added "s")
      await apiFetch(`system-controls/${system.id}/`, {
        method: "PUT",
        body: payload,
      });

      // Reload after update
      loadSystem();
    } catch (err) {
      console.error("Failed to update system:", err);
    }
  };

  // ---------------- LOAD ON APP START ----------------
  useEffect(() => {
    const session = sessionStorage.getItem("ucs_current");
    if (session) {
      loadSystem();
    }
  }, []);

  return (
    <SystemContext.Provider value={{ system, updateSystem }}>
      {children}
    </SystemContext.Provider>
  );
}
