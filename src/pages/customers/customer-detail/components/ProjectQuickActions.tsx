import { useNavigate } from "react-router-dom";
import type {
  ProjectOverview,
  ProjectContact,
  ProjectAgreement,
  ProjectActionLinks,
} from "@/redux/api/projectApi";

interface ProjectQuickActionsProps {
  basePath: string;
  projectId: string;
  customerId?: string;
  overview?: ProjectOverview;
  contact?: ProjectContact;
  agreement?: ProjectAgreement;
  actionLinks?: ProjectActionLinks;
  onOpenMaterialDelivery: () => void;
}

export function ProjectQuickActions({
  basePath,
  projectId,
  customerId,
  overview,
  contact,
  agreement,
  actionLinks,
  onOpenMaterialDelivery,
}: ProjectQuickActionsProps) {
  const navigate = useNavigate();

  const commonState = {
    projectName: overview?.projectName || "",
    projectId: overview?.projectId || projectId,
    leadId: overview?.leadId || projectId,
    customerId: customerId || "",
    customerName: contact?.name || "",
  };

  const quickActions = [
    {
      label: "View Invoices",
      onClick: () =>
        navigate(`${basePath}/project-invoices`, {
          state: {
            ...commonState,
            actionLink: actionLinks?.invoices,
          },
        }),
    },
    {
      label: "View BOM",
      onClick: () =>
        navigate(`${basePath}/bom`, {
          state: {
            ...commonState,
            actionLink: actionLinks?.bom,
          },
        }),
    },
    {
      label: "View Payments",
      onClick: () =>
        navigate(`${basePath}/project-payments`, {
          state: {
            ...commonState,
            actionLink: actionLinks?.payments,
          },
        }),
    },
    {
      label: "Material Delivery",
      onClick: onOpenMaterialDelivery,
    },
    {
      label: "View Quotation",
      onClick: () =>
        navigate(`${basePath}/project-quotation`, {
          state: {
            ...commonState,
            actionLink: actionLinks?.quotation,
          },
        }),
    },
    {
      label: "View Agreement",
      onClick: () => {
        if (agreement?.url) {
          window.open(agreement.url, "_blank");
        } else {
          navigate(`${basePath}/contracts`, {
            state: {
              ...commonState,
              actionLink: actionLinks?.agreement,
            },
          });
        }
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {quickActions.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.onClick}
          className="w-full bg-[#1D51A4] hover:bg-[#153E7E] text-white rounded-lg shadow-xs font-medium text-sm h-11 flex items-center justify-center transition-all cursor-pointer hover:shadow-sm"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
