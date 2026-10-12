import ProjectInvoicesPage from "./ProjectInvoicesPage";

export default function MiscellaneousInvoicesPage() {
  const miscInvoices = [
    {
      id: "misc-1",
      invoiceId: "MSC00501",
      project: "General Project Support",
      customer: "Local Utilities",
      invoiceType: "Utility",
      amount: 8500,
      amountFormatted: "$8,500",
      invDate: "10 Feb 2025",
      dueDate: "10 Feb 2025",
      paymentStatus: "Pending" as const,
    },
    {
      id: "misc-2",
      invoiceId: "MSC00502",
      project: "Site Setup",
      customer: "Safety Equipments Co",
      invoiceType: "Supplies",
      amount: 15400,
      amountFormatted: "$15,400",
      invDate: "28 Jan 2025",
      dueDate: "28 Jan 2025",
      paymentStatus: "Complete" as const,
    },
  ];

  return (
    <ProjectInvoicesPage
      tableTitle="Miscellaneous Invoices"
      defaultInvoices={miscInvoices}
    />
  );
}
