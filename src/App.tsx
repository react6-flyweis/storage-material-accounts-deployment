import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { Suspense } from "react";
import "./App.css";
import LoadingScreen from "./components/LoadingScreen";
import * as Sentry from "@sentry/react";
import ErrorBoundary from "./pages/ErrorPage";
import { SocketProvider } from "./context/SocketContext";

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);
const router = sentryCreateBrowserRouter(routes);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
