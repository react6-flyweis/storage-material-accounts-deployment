import * as Sentry from "@sentry/react";
import React from "react";

import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  initialScope: {
    tags: {
      panel: "accounts",
    },
  },
  dataCollection: {},
  integrations: [
    Sentry.replayIntegration(),
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    /^\//,
    ...(import.meta.env.VITE_API_BASE_URL ? [import.meta.env.VITE_API_BASE_URL] : []),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
