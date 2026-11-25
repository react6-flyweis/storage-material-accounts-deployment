import { anchor, click, dialog, enabledAnchor, modal } from "./tour-helpers";

// Modals the tours open, shared by several of them. None of them is ever submitted.

export const orderPaymentModal = modal(
  "order-payment-modal",
  click(
    anchor("payment-row-view"),
    "View an Order",
    "The <b>eye</b> icon opens that order's payments.",
    true,
  ),
);

export const paymentApprovalModal = modal(
  "payment-approval-modal",
  click(
    anchor("approvals-row-view"),
    "Open a Request",
    "The <b>eye</b> icon opens the payment request.",
    true,
  ),
);

export const marginAnalysisModal = modal(
  "margin-analysis-modal",
  click(
    anchor("margin-analysis-open"),
    "Open the Analysis",
    "<b>View Profit & Loss Analysis</b> opens a detailed breakdown.",
  ),
);

export const budgetModal = modal(
  "budget-modal",
  click(
    enabledAnchor("budget-configure"),
    "Configure the Budget",
    "<b>Configure Budget</b> opens the project's budget form.",
    true,
  ),
  anchor("budget-modal-close"),
);

export const salaryModal = modal(
  "salary-modal",
  click(
    anchor("salary-row-view"),
    "View a Salary",
    "The <b>eye</b> icon opens the employee's salary details.",
    true,
  ),
  anchor("salary-modal-close"),
);

export const incomeTransactionModal = dialog(
  "income-transaction-modal",
  click(
    anchor("income-transaction-view"),
    "View a Transaction",
    "The <b>eye</b> icon opens that transaction.",
    true,
  ),
);

export const addIncomeModal = dialog(
  "income-add-modal",
  click(
    anchor("income-add"),
    "Add Income",
    "This button opens the income form.",
  ),
);

export const expenseTransactionModal = dialog(
  "expense-transaction-modal",
  click(
    anchor("expense-transaction-view"),
    "View an Expense",
    "The <b>eye</b> icon opens that expense.",
    true,
  ),
);

/** The sheet slides in slower than a modal appears. */
export const taxDetailsSheet = {
  ...dialog(
    "tax-details-sheet",
    click(
      anchor("tax-row-review"),
      "Review a Record",
      "This opens the record's details.",
      true,
    ),
    `${anchor("tax-details-sheet")} > [data-slot="sheet-close"]`,
  ),
  settleMs: 600,
};

export const freightModal = dialog(
  "freight-modal",
  click(
    anchor("freight-row-view"),
    "View a Delivery",
    "The <b>eye</b> icon opens that freight record.",
    true,
  ),
  anchor("freight-modal-close"),
);

export const logisticsModal = dialog(
  "logistics-modal",
  click(
    anchor("logistics-row-view"),
    "View a Record",
    "The <b>eye</b> icon opens that logistics record.",
    true,
  ),
  anchor("logistics-modal-close"),
);

export const sendInvoiceModal = modal(
  "send-invoice-modal",
  click(
    enabledAnchor("invoice-email"),
    "Email the Invoice",
    "<b>Email Invoice</b> opens the email form.",
    true,
  ),
);

export const uploadMiscInvoiceModal = modal(
  "misc-upload-modal",
  click(
    anchor("misc-invoice-upload"),
    "Upload an Invoice",
    "This button opens the upload form.",
  ),
  anchor("misc-upload-close"),
);

export const miscInvoiceModal = modal(
  "misc-details-modal",
  click(
    anchor("misc-invoice-view"),
    "View an Invoice",
    "The view button opens that invoice's details.",
    true,
  ),
  anchor("misc-details-close"),
);

export const quotationUploadModal = modal(
  "quotation-pl-upload-modal",
  click(
    anchor("quotation-pl-upload"),
    "Upload Actuals",
    "This button opens the upload form.",
  ),
  anchor("quotation-pl-upload-close"),
);

export const quotationModal = modal(
  "quotation-pl-modal",
  click(
    anchor("quotation-pl-view"),
    "View a Quotation",
    "The view button opens that quotation's details.",
    true,
  ),
  anchor("quotation-pl-close"),
);
