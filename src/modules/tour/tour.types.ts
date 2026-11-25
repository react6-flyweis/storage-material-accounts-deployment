export type TourId =
  | "accounts-overview"
  | "payment-flow"
  | "customer-project"
  | "finance-guide"
  | "income-expense-guide"
  | "cost-guide"
  | "invoice-guide";

/** Offers a jump into a more detailed tour from this step. */
export interface TourStepBranchConfig {
  tourId: TourId;
  label: string;
  description?: string;
  /** Step of the current tour to resume at afterwards: the next section's first. */
  resumeStepId: string;
}

/** A control the tour highlights, then waits for the user (or Next) to click. */
export interface TourClickConfig {
  element: string;
  title: string;
  description: string;
  speechText?: string;
  /** May legitimately be absent (depends on data); give up on it quickly. */
  optional?: boolean;
}

/**
 * The in-page control a user clicks to reach this step's page (a row's View
 * button, a quick-action button...). The tour highlights it before moving on.
 */
export interface TourStepViaConfig extends TourClickConfig {
  /** Page the control lives on. May contain route params like `:projectId`. */
  fromRoute: string;
  /** Panels the control lives in, e.g. a modal with a View button. */
  panels?: TourPanelConfig[];
  /** Open the page directly, instead of skipping it, when the control is absent. */
  openAnyway?: boolean;
}

/**
 * Something on the page that has to be opened before a step can be shown: a
 * modal, a dialog inside a modal, or a tab.
 */
export interface TourPanelConfig {
  /** Present in the DOM only while the panel is open. */
  element: string;
  open: TourClickConfig;
  /** Control that closes it. Defaults to the backdrop of the shared Modal. */
  close?: string;
  /** How long its entrance animation takes, when longer than most. */
  settleMs?: number;
}

export interface TourStepConfig {
  id: string;
  /** May contain params such as `:projectId` or `:id`; resolved at runtime. */
  route: string;
  element: string;
  title: string;
  description: string;
  speechText?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  branch?: TourStepBranchConfig;
  via?: TourStepViaConfig;
  /** Panels this step lives in, outermost first. Kept open across steps that share them. */
  panels?: TourPanelConfig[];
  /** Explain the step without a highlight, adding this note, when it has nothing to show yet. */
  whenMissing?: string;
  /** Blocks clicks on the highlighted element. Defaults to true inside panels. */
  locked?: boolean;
  /** Target may legitimately be absent (depends on data); skip quickly if so. */
  optional?: boolean;
}

/** Introduces a whole page before the tour goes through its sections. */
export interface TourPageIntro {
  title: string;
  description: string;
  /** A step on this element already shows the whole page, so it needs no intro. */
  coveredBy?: string;
}

export interface TourDefinition {
  id: TourId;
  name: string;
  description: string;
  estimatedMinutes: number;
  /** Stop with a message, instead of skipping steps, when no project exists. */
  requiresProject?: boolean;
  steps: TourStepConfig[];
}
