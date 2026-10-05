import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { NotFound } from "@/pages/not-found";
import { MainLayout } from "./components/layout/main-layout";
import { RequireAuth, RedirectIfAuthenticated, RootRedirect } from "./components/route-auth";
import { RouterErrorFallback } from "./pages/ErrorPage";

import CommunicationView from "./components/communication/CommunicationView";
import NotificationsView from "./components/notifications/NotificationsView";
import SettingsView from "./components/settings/SettingsView";
import ProfileView from "./components/profile/ProfileView";
import PaymentOverview from "./pages/PaymentOverview";
import PaymentApprovalsPage from "./pages/PaymentApprovalsPage";
import UpdatePaymentPage from "./pages/UpdatePaymentPage";
import OrdersAndPaymentsPage from "./pages/OrdersAndPaymentsPage";
import WipProfitPage from "./pages/analysis/WipProfitPage";
import CogsAnalysis from "./pages/analysis/CogsAnalysis";
import ExpensesPage from "./pages/management/ExpensesPage";
import IncomePage from "./pages/management/IncomePage";
import LaborExpensesPage from "./pages/management/LaborExpensesPage";

const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NewInvoice = lazy(() => import("@/pages/NewInvoice"));
const InvoicePreview = lazy(() => import("@/pages/InvoicePreview"));
const FinancialReportPage = lazy(
  () => import("@/pages/management/FinancialReportPage")
);
const TaxationPage = lazy(() => import("@/pages/management/TaxationPage"));

export const routes: RouteObject[] = [
  {
    element: <RequireAuth />,
    errorElement: <RouterErrorFallback />,
    children: [
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
            path: "/payment_approvals",
            element: <PaymentApprovalsPage />,
          },
          {
            path: "/payment_overview/update",
            element: <UpdatePaymentPage />,
          },
          {
            path: "/payment_overview/add",
            element: <UpdatePaymentPage title="Add Payment" />,
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
          {
            path: "/notification",
            element: <NotificationsView />,
          },
          {
            path: "/settings",
            element: <SettingsView />,
          },
          {
            path: "/profile",
            element: <ProfileView />,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
    ],
  },
  {
    element: <RedirectIfAuthenticated />,
    errorElement: <RouterErrorFallback />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const adminRoutes = routes;
