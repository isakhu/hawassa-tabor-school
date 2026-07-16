"use client";

import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Ignore cleanup failures; stale workers should not break the app.
          });
        });
      })
      .catch(() => {
        // Safe no-op for browsers or modes that block service worker access.
      });
  }, []);

  return null;
}
