import type { TourStepConfig } from "../tour.types";
import { anchor } from "./tour-helpers";
import { taxDetailsSheet } from "./panels";

/** One step per tax page and one record. Taxation has no guide of its own. */
export const taxationSteps: TourStepConfig[] = [
  {
    id: "tax-records",
    route: "/tax-and-filing",
    element: anchor("tax-records"),
    title: "Tax & Filing: Records",
    description:
      "<b>Pending Filing</b> lists what still has to be filed. <b>Filing History</b> keeps past filings and their receipts. Filter them by state, project, dates or client above.",
    speechText: "See what still has to be filed, and your filing history.",
    side: "top",
    locked: true,
  },
  {
    id: "tax-detail",
    route: "/tax-and-filing",
    element: anchor("tax-details-sheet"),
    title: "Tax & Filing: Details",
    description:
      "The record in full. From here or from its row, prepare the filing, pay the tax, or mark it as filed if you paid it elsewhere.",
    speechText: "The record in full. Prepare the filing, pay the tax, or mark it as filed.",
    side: "left",
    panels: [taxDetailsSheet],
  },
  {
    id: "state-table",
    route: "/state-wise-tax",
    element: anchor("state-tax-table"),
    title: "State Wise Tax",
    description:
      "Every state with its rate, tax and status. <b>Pay Tax</b> or <b>View Details</b> is at the end of each row.",
    speechText: "Every state, with its tax and status.",
    side: "top",
    locked: true,
  },
  {
    id: "ptax-table",
    route: "/project-wise-tax",
    element: anchor("project-tax-table"),
    title: "Project Wise Tax",
    description:
      "The same layout and actions, per project.",
    speechText: "The same layout and actions, per project.",
    side: "top",
    locked: true,
  },
];
