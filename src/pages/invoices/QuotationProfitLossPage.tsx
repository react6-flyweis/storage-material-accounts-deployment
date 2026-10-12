import ProjectInvoicesPage from "./ProjectInvoicesPage";

export default function QuotationProfitLossPage() {
  const quotationInvoices = [
    {
      id: "qpl-1",
      invoiceId: "QPL-0001",
      project: "ABC Warehouse",
      customer: "John Doe",
      invoiceType: "Quotation P&L",
      amount: 145000,
      amountFormatted: "$1,45,000",
      invDate: "15 Jan 2025",
      dueDate: "15 Feb 2025",
      paymentStatus: "Complete" as const,
    },
    {
      id: "qpl-2",
      invoiceId: "QPL-0002",
      project: "Warehouse Expansion",
      customer: "Aayush Kapoor",
      invoiceType: "Quotation P&L",
      amount: 320000,
      amountFormatted: "$3,20,000",
      invDate: "02 Feb 2025",
      dueDate: "02 Mar 2025",
      paymentStatus: "Pending" as const,
    },
  ];

  return (
    <ProjectInvoicesPage
      tableTitle="Quotation-wise Profit / Loss"
      defaultInvoices={quotationInvoices}
    />
  );
}
