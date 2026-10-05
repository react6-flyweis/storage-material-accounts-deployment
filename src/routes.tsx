import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { MainLayout } from "./components/layout/main-layout";
import CommunicationView from "./components/communication/CommunicationView";
import NotificationsView from "./components/notifications/NotificationsView";
import SettingsView from "./components/settings/SettingsView";
import ProfileView from "./components/profile/ProfileView";
import PaymentOverview from "./pages/PaymentOverview";
import OrdersAndPaymentsPage from "./pages/OrdersAndPaymentsPage";
import WipProfitPage from "./pages/analysis/WipProfitPage";
import CogsAnalysis from "./pages/analysis/CogsAnalysis";
import ExpensesPage from "./pages/management/ExpensesPage";
import IncomePage from "./pages/management/IncomePage";
import LaborExpensesPage from "./pages/management/LaborExpensesPage";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NewInvoice = lazy(() => import("@/pages/NewInvoice"));
const InvoicePreview = lazy(() => import("@/pages/InvoicePreview"));
const FinancialReportPage = lazy(
  () => import("@/pages/management/FinancialReportPage")
);
const TaxationPage = lazy(() => import("@/pages/management/TaxationPage"));
export const adminRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/payment_overview",
        element: <PaymentOverview />,
      },
      {
        path: "/payments/new-invoice",
        element: <NewInvoice />,
      },
      {
        path: "/payments/invoice/preview",
        element: <InvoicePreview />,
      },
      {
        path: "/order_payments",
        element: <OrdersAndPaymentsPage />,
      },
      {
        path: "/cogs_analysis",
        element: <CogsAnalysis />,
      },

      {
        path: "/expenses",
        element: <ExpensesPage />,
      },
      {
        path: "/communication",
        element: <CommunicationView />,
      },
      {
        path: "/wip_profit",
        element: <WipProfitPage />,
      },
      {
        path: "/reports",
        element: <FinancialReportPage />,
      },
      {
        path: "/taxation",
        element: <TaxationPage />,
      },
      {
        path: "/income",
        element: <IncomePage />,
      },
      {
        path: "/labor_expenses",
        element: <LaborExpensesPage />,
      },
      { path: "/notification", element: <NotificationsView /> },
      {
        path: "settings",
        element: <SettingsView />,
      },
      {
        path: "profile",
        element: <ProfileView />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];
