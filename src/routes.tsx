import { Navigate, type RouteObject } from "react-router-dom";
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
import AddPaymentPage from "./pages/AddPaymentPage";
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
const MaterialDeliveryPage = lazy(
  () => import("@/pages/customers/customer-detail/material-delivery")
);
const SalaryCostPage = lazy(() => import("@/pages/SalaryCostPage"));
const AddSalaryPage = lazy(() => import("@/pages/cost/AddSalaryPage"));
const ManpowerCostPage = lazy(() => import("@/pages/ManpowerCostPage"));
const AddManpowerPage = lazy(() => import("@/pages/cost/AddManpowerPage"));
const MiscellaneousCostPage = lazy(() => import("@/pages/MiscellaneousCostPage"));
const AddMiscellaneousCostPage = lazy(() => import("@/pages/cost/AddMiscellaneousCostPage"));
const FreightCostPage = lazy(() => import("@/pages/cost/FreightCostPage"));
const LogisticsCostPage = lazy(() => import("@/pages/cost/LogisticsCostPage"));
const AddLogisticCostPage = lazy(() => import("@/pages/cost/AddLogisticCostPage"));
const ItemCostListPage = lazy(() => import("@/pages/cost/ItemCostListPage"));
const RentCostPage = lazy(() => import("@/pages/cost/RentCostPage"));
const AddRentCostPage = lazy(() => import("@/pages/cost/AddRentCostPage"));
const FutureIncomeExpenseAnalysisPage = lazy(
  () => import("@/pages/cost/FutureIncomeExpenseAnalysisPage")
);
const CostVariancePage = lazy(() => import("@/pages/cost/CostVariancePage"));
const InvoiceManagementPage = lazy(
  () => import("@/pages/invoices/ProjectInvoicesPage")
);
const VendorInvoicesPage = lazy(
  () => import("@/pages/invoices/VendorInvoicesPage")
);
const VendorInvoiceDetailPage = lazy(
  () => import("@/pages/invoices/VendorInvoiceDetailPage")
);
const CarrierInvoicesPage = lazy(
  () => import("@/pages/invoices/CarrierInvoicesPage")
);
const CarrierInvoiceDetailPage = lazy(
  () => import("@/pages/invoices/CarrierInvoiceDetailPage")
);
const MiscellaneousInvoicesPage = lazy(
  () => import("@/pages/invoices/MiscellaneousInvoicesPage")
);
const QuotationProfitLossPage = lazy(
  () => import("@/pages/invoices/QuotationProfitLossPage")
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
            path: "/payment-overview",
            element: <PaymentOverview />,
          },
          {
            path: "/payment_approvals",
            element: <PaymentApprovalsPage />,
          },
          {
            path: "/payment_overview/add",
            element: <AddPaymentPage />,
          },
          {
            path: "/payment-overview/add",
            element: <AddPaymentPage />,
          },
          {
            path: "/payment_overview/edit/:id?",
            element: <AddPaymentPage />,
          },
          {
            path: "/payment-overview/edit/:id?",
            element: <AddPaymentPage />,
          },
          {
            path: "/payment_overview/update/:id?",
            element: <AddPaymentPage />,
          },
          {
            path: "/payment-overview/update/:id?",
            element: <AddPaymentPage />,
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
            path: "/customers/projects/:id/project-quotation/:quotationId",
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
            path: "/customers/projects/:id/project-invoices/:invoiceId",
            element: <InvoicePreview />,
          },
          {
            path: "/customers/projects/:id/project-invoices/:id",
            element: <InvoicePreview />,
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
            path: "/customers/projects/:id/material-delivery",
            element: <MaterialDeliveryPage />,
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
            path: "/customers/:customerId/projects/:projectId/project-quotation/:quotationId",
            element: <ProjectQuotationPage />,
          },
          {
            path: "/customers/:customerId/project-quotation",
            element: <ProjectQuotationPage />,
          },
          {
            path: "/customers/:customerId/project-quotation/:quotationId",
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
            path: "/customers/:customerId/projects/:projectId/project-invoices/:invoiceId",
            element: <InvoicePreview />,
          },
          {
            path: "/customers/:customerId/project-invoices",
            element: <ProjectInvoicesPage />,
          },
          {
            path: "/customers/:customerId/project-invoices/:invoiceId",
            element: <InvoicePreview />,
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
            path: "/customers/:customerId/projects/:projectId/material-delivery",
            element: <MaterialDeliveryPage />,
          },
          {
            path: "/customers/:customerId/material-delivery",
            element: <MaterialDeliveryPage />,
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
            path: "/salary-cost",
            element: <SalaryCostPage />,
          },
          {
            path: "/salary-cost/add",
            element: <AddSalaryPage />,
          },
          {
            path: "/salary/add",
            element: <AddSalaryPage />,
          },
          {
            path: "/cost",
            element: <Navigate to="/cost/salary-cost" replace />,
          },
          {
            path: "/cost/salary-cost",
            element: <SalaryCostPage />,
          },
          {
            path: "/cost/salary-cost/add",
            element: <AddSalaryPage />,
          },
          {
            path: "/cost/manpower-cost",
            element: <ManpowerCostPage />,
          },
          {
            path: "/cost/manpower-cost/add",
            element: <AddManpowerPage />,
          },
          {
            path: "/cost/manpower-cost/edit/:id?",
            element: <AddManpowerPage />,
          },
          {
            path: "/cost/manpower-cost/edit",
            element: <AddManpowerPage />,
          },
          {
            path: "/cost/miscellaneous-cost",
            element: <MiscellaneousCostPage />,
          },
          {
            path: "/cost/miscellaneous-cost/add",
            element: <AddMiscellaneousCostPage />,
          },
          {
            path: "/cost/freight-cost",
            element: <FreightCostPage />,
          },
          {
            path: "/freight-cost",
            element: <FreightCostPage />,
          },
          {
            path: "/cost/logistics-cost",
            element: <LogisticsCostPage />,
          },
          {
            path: "/cost/logistics-cost/add",
            element: <AddLogisticCostPage />,
          },
          {
            path: "/logistics-cost",
            element: <LogisticsCostPage />,
          },
          {
            path: "/logistics-cost/add",
            element: <AddLogisticCostPage />,
          },
          {
            path: "/cost/item-cost-list",
            element: <ItemCostListPage />,
          },
          {
            path: "/item-cost-list",
            element: <ItemCostListPage />,
          },
          {
            path: "/cost/rent-cost",
            element: <RentCostPage />,
          },
          {
            path: "/cost/rent-cost/add",
            element: <AddRentCostPage />,
          },
          {
            path: "/rent-cost",
            element: <RentCostPage />,
          },
          {
            path: "/rent-cost/add",
            element: <AddRentCostPage />,
          },
          {
            path: "/cost/future-analysis",
            element: <FutureIncomeExpenseAnalysisPage />,
          },
          {
            path: "/cost/future-income-expense-analysis",
            element: <FutureIncomeExpenseAnalysisPage />,
          },
          {
            path: "/future-income-expense-analysis",
            element: <FutureIncomeExpenseAnalysisPage />,
          },
          {
            path: "/cost/cost-variance",
            element: <CostVariancePage />,
          },
          {
            path: "/cost/variance-analysis",
            element: <CostVariancePage />,
          },
          {
            path: "/cost-variance",
            element: <CostVariancePage />,
          },
          {
            path: "/miscellaneous-cost",
            element: <MiscellaneousCostPage />,
          },
          {
            path: "/miscellaneous-cost/add",
            element: <AddMiscellaneousCostPage />,
          },
          {
            path: "/salary-cost",
            element: <SalaryCostPage />,
          },
          {
            path: "/salary-cost/add",
            element: <AddSalaryPage />,
          },
          {
            path: "/salary/add",
            element: <AddSalaryPage />,
          },
          {
            path: "/manpower-cost",
            element: <ManpowerCostPage />,
          },
          {
            path: "/manpower-cost/add",
            element: <AddManpowerPage />,
          },
          {
            path: "/manpower-cost/edit/:id?",
            element: <AddManpowerPage />,
          },
          {
            path: "/manpower-cost/edit",
            element: <AddManpowerPage />,
          },
          {
            path: "/manpower/add",
            element: <AddManpowerPage />,
          },
          {
            path: "/manpower/edit/:id?",
            element: <AddManpowerPage />,
          },
          {
            path: "/manpower/edit",
            element: <AddManpowerPage />,
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
            path: "/invoices",
            element: <InvoiceManagementPage />,
          },
          {
            path: "/invoices/project-invoices",
            element: <InvoiceManagementPage />,
          },
          {
            path: "/invoices/project-invoices/:id",
            element: <InvoicePreview />,
          },
          {
            path: "/project-invoices",
            element: <InvoiceManagementPage />,
          },
          {
            path: "/project-invoices/:id",
            element: <InvoicePreview />,
          },
          {
            path: "/invoices/:id",
            element: <InvoicePreview />,
          },
          {
            path: "/invoices/vendor-invoices",
            element: <VendorInvoicesPage />,
          },
          {
            path: "/invoices/vendor-invoices/:id",
            element: <VendorInvoiceDetailPage />,
          },
          {
            path: "/vendor-invoices",
            element: <VendorInvoicesPage />,
          },
          {
            path: "/vendor-invoices/:id",
            element: <VendorInvoiceDetailPage />,
          },
          {
            path: "/invoices/carrier-invoices",
            element: <CarrierInvoicesPage />,
          },
          {
            path: "/carrier-invoices",
            element: <CarrierInvoicesPage />,
          },
          {
            path: "/carrier-invoices/:id",
            element: <CarrierInvoiceDetailPage />,
          },
          {
            path: "/invoices/carrier-invoices/:id",
            element: <CarrierInvoiceDetailPage />,
          },
          {
            path: "/invoices/freight-invoices",
            element: <CarrierInvoicesPage />,
          },
          {
            path: "/freight-invoices",
            element: <CarrierInvoicesPage />,
          },
          {
            path: "/invoices/miscellaneous-invoices",
            element: <MiscellaneousInvoicesPage />,
          },
          {
            path: "/invoices/quotation-profit-loss",
            element: <QuotationProfitLossPage />,
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
