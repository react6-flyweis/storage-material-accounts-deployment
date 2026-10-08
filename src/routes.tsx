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
import MarginAnalysisPage from "./pages/MarginAnalysisPage";
import ProjectBudgetDetailsPage from "./pages/ProjectBudgetDetailsPage";
import WipProfitPage from "./pages/analysis/WipProfitPage";
import CogsAnalysis from "./pages/analysis/CogsAnalysis";
import ExpensesPage from "./pages/management/ExpensesPage";
import IncomePage from "./pages/management/IncomePage";
import LaborExpensesPage from "./pages/management/LaborExpensesPage";

const ProjectWiseIncomePage = lazy(
  () => import("@/pages/ProjectWiseIncomePage")
);
const ProjectWiseIncomeDetailPage = lazy(
  () => import("@/pages/ProjectWiseIncomeDetailPage")
);
const ProjectWiseExpensePage = lazy(
  () => import("@/pages/ProjectWiseExpensePage")
);
const ProjectWiseExpenseDetailPage = lazy(
  () => import("@/pages/ProjectWiseExpenseDetailPage")
);
const ProfitLossStatementPage = lazy(
  () => import("@/pages/ProfitLossStatementPage")
);
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
const SalesTaxFiling = lazy(() => import("@/pages/payments/sales-tax-filing"));
const StateWiseTax = lazy(() => import("@/pages/payments/state-wise-tax"));
const ProjectWiseTax = lazy(() => import("@/pages/payments/project-wise-tax"));
const CustomersPage = lazy(() => import("@/pages/customers/CustomersPage"));
const CustomerProjectsPage = lazy(
  () => import("@/pages/customers/CustomerProjectsPage")
);
const CustomerDetailPage = lazy(
  () => import("@/pages/customers/CustomerDetailPage")
);
const ProjectDetailsPage = lazy(
  () => import("@/pages/customers/customer-detail/project-details")
);
const ProjectQuotationPage = lazy(
  () => import("@/pages/customers/customer-detail/project-quotation")
);
const ContractDetailPage = lazy(
  () => import("@/pages/customers/contract-detail")
);
const ProjectInvoicesPage = lazy(
  () => import("@/pages/customers/customer-detail/project-invoices")
);
const ProjectPaymentsPage = lazy(
  () => import("@/pages/customers/customer-detail/project-payments")
);
const ProjectBomPage = lazy(
  () => import("@/pages/customers/customer-detail/project-bom")
);

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
            path: "/margin_analysis",
            element: <MarginAnalysisPage />,
          },
          {
            path: "/payments/margin-analysis",
            element: <MarginAnalysisPage />,
          },
          {
            path: "/project_budget_details",
            element: <ProjectBudgetDetailsPage />,
          },
          {
            path: "/project-details",
            element: <ProjectBudgetDetailsPage />,
          },
          {
            path: "/payments/project-details",
            element: <ProjectBudgetDetailsPage />,
          },
          {
            path: "/customers",
            element: <CustomersPage />,
          },
          {
            path: "/customers/projects",
            element: <CustomerProjectsPage />,
          },
          {
            path: "/customers/projects/:id",
            element: <ProjectDetailsPage />,
          },
          {
            path: "/customers/projects/:id/project-quotation",
            element: <ProjectQuotationPage />,
          },
          {
            path: "/customers/projects/:id/contracts",
            element: <ContractDetailPage />,
          },
          {
            path: "/customers/projects/:id/project-invoices",
            element: <ProjectInvoicesPage />,
          },
          {
            path: "/customers/projects/:id/project-payments",
            element: <ProjectPaymentsPage />,
          },
          {
            path: "/customers/projects/:id/bom",
            element: <ProjectBomPage />,
          },
          {
            path: "/customers/:customerId",
            element: <CustomerDetailPage />,
          },
          {
            path: "/customers/:customerId/projects",
            element: <CustomerProjectsPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId",
            element: <ProjectDetailsPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId/project-quotation",
            element: <ProjectQuotationPage />,
          },
          {
            path: "/customers/:customerId/project-quotation",
            element: <ProjectQuotationPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId/contracts",
            element: <ContractDetailPage />,
          },
          {
            path: "/customers/:customerId/contracts",
            element: <ContractDetailPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId/project-invoices",
            element: <ProjectInvoicesPage />,
          },
          {
            path: "/customers/:customerId/project-invoices",
            element: <ProjectInvoicesPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId/project-payments",
            element: <ProjectPaymentsPage />,
          },
          {
            path: "/customers/:customerId/projects/:projectId/bom",
            element: <ProjectBomPage />,
          },
          {
            path: "/customers/:customerId/bom",
            element: <ProjectBomPage />,
          },
          {
            path: "/customers/:customerId/project-payments",
            element: <ProjectPaymentsPage />,
          },
          {
            path: "/project-wise-income",
            element: <ProjectWiseIncomePage />,
          },
          {
            path: "/project-wise-income/:projectId",
            element: <ProjectWiseIncomeDetailPage />,
          },
          {
            path: "/project-wise-income/detail",
            element: <ProjectWiseIncomeDetailPage />,
          },
          {
            path: "/project_wise_income",
            element: <ProjectWiseIncomePage />,
          },
          {
            path: "/project_wise_income/:projectId",
            element: <ProjectWiseIncomeDetailPage />,
          },
          {
            path: "/project-wise-expense",
            element: <ProjectWiseExpensePage />,
          },
          {
            path: "/project-wise-expense/:projectId",
            element: <ProjectWiseExpenseDetailPage />,
          },
          {
            path: "/project-wise-expense/detail",
            element: <ProjectWiseExpenseDetailPage />,
          },
          {
            path: "/project_wise_expense",
            element: <ProjectWiseExpensePage />,
          },
          {
            path: "/project_wise_expense/:projectId",
            element: <ProjectWiseExpenseDetailPage />,
          },
          {
            path: "/project-expense",
            element: <ProjectWiseExpensePage />,
          },
          {
            path: "/project-expense/:projectId",
            element: <ProjectWiseExpenseDetailPage />,
          },
          {
            path: "/profit-loss",
            element: <ProfitLossStatementPage />,
          },
          {
            path: "/profit-and-loss",
            element: <ProfitLossStatementPage />,
          },
          {
            path: "/profit_loss",
            element: <ProfitLossStatementPage />,
          },
          {
            path: "/profit-loss-statement",
            element: <ProfitLossStatementPage />,
          },
          {
            path: "/analytics",
            element: <ProjectWiseIncomePage />,
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
            path: "/tax-and-filing",
            element: <SalesTaxFiling />,
          },
          {
            path: "/sales-tax-filing",
            element: <SalesTaxFiling />,
          },
          {
            path: "/payments/sales-tax-filing",
            element: <SalesTaxFiling />,
          },
          {
            path: "/state-wise-tax",
            element: <StateWiseTax />,
          },
          {
            path: "/payments/state-wise-tax",
            element: <StateWiseTax />,
          },
          {
            path: "/project-wise-tax",
            element: <ProjectWiseTax />,
          },
          {
            path: "/payments/project-wise-tax",
            element: <ProjectWiseTax />,
          },
          {
            path: "/taxation",
            element: <SalesTaxFiling />,
          },
          {
            path: "/taxation-old",
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
