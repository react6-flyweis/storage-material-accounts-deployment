import {
  ArrowLeftRight,
  CircleDollarSign,
  FileText,
  FolderOpen,
  HelpCircle,
  PlayCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tourCoordinator } from "../tour.service";
import { useTourStore } from "../tour.store";
import type { TourDefinition } from "../tour.types";
import { accountsOverviewTour } from "../tours/accounts-overview.tour";
import { paymentFlowTour } from "../tours/payment-flow.tour";
import { customerProjectTour } from "../tours/customer-project.tour";
import { financeGuideTour } from "../tours/finance-guide.tour";
import { incomeExpenseGuideTour } from "../tours/income-expense-guide.tour";
import { costGuideTour } from "../tours/cost-guide.tour";
import { invoiceGuideTour } from "../tours/invoice-guide.tour";

interface TourMenuEntry {
  tour: TourDefinition;
  label: string;
  hint: string;
  icon: LucideIcon;
  iconClassName: string;
}

const TOUR_MENU: TourMenuEntry[] = [
  {
    tour: accountsOverviewTour,
    label: "Start Walkthrough",
    hint: "The layout and every section, in brief",
    icon: PlayCircle,
    iconClassName: "text-[#1D51A4]",
  },
  {
    tour: customerProjectTour,
    label: "Customer Project Guide",
    hint: "A project's finances and every sub-page",
    icon: FolderOpen,
    iconClassName: "text-[#EAB308]",
  },
  {
    tour: financeGuideTour,
    label: "Finance Guide",
    hint: "Payments, approvals, margins and budgets",
    icon: CircleDollarSign,
    iconClassName: "text-[#A855F7]",
  },
  {
    tour: incomeExpenseGuideTour,
    label: "Income & Expense Guide",
    hint: "A project's income, expenses and profit",
    icon: ArrowLeftRight,
    iconClassName: "text-[#EAB308]",
  },
  {
    tour: costGuideTour,
    label: "Cost Guide",
    hint: "Every cost page and how to add costs",
    icon: Wallet,
    iconClassName: "text-[#2B7FFF]",
  },
  {
    tour: invoiceGuideTour,
    label: "Invoice Guide",
    hint: "Invoices, previews and uploads",
    icon: FileText,
    iconClassName: "text-[#2D2D2D]",
  },
  {
    tour: paymentFlowTour,
    label: "Payment Flow Guide",
    hint: "From customer payments to payables and tax",
    icon: Workflow,
    iconClassName: "text-[#FF8800]",
  },
];

export function TourHubMenu() {
  const navigate = useNavigate();
  const { isAudioMuted, toggleAudioMute, resetAllTours } = useTourStore();

  const handleLaunchTour = (tour: TourDefinition) => {
    tourCoordinator.init(navigate);
    void tourCoordinator.startTour(tour);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAudioMute();
    toast.info(isAudioMuted ? "Voice guidance enabled" : "Voice guidance muted");
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetAllTours();
    toast.success("Walkthrough history reset");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-tour="tour-hub-btn"
          className="rounded-full hover:bg-slate-100"
          title="Product Walkthrough"
        >
          <HelpCircle className="size-5 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-white shadow-lg border border-slate-200 p-2"
      >
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Product Walkthrough
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleMute}
              onPointerDown={(e) => e.stopPropagation()}
              className="size-7 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title={isAudioMuted ? "Unmute voice guidance" : "Mute voice guidance"}
            >
              {isAudioMuted ? (
                <VolumeX className="size-4 text-red-500" />
              ) : (
                <Volume2 className="size-4 text-blue-600" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              onPointerDown={(e) => e.stopPropagation()}
              className="size-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Reset walkthrough history"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {TOUR_MENU.map(({ tour, label, hint, icon: Icon, iconClassName }) => (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => handleLaunchTour(tour)}
            className="flex items-center gap-2 cursor-pointer py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon className={`size-4 ${iconClassName}`} />
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-xs text-slate-500">{hint}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
