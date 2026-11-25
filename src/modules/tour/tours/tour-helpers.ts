import type { TourClickConfig, TourPanelConfig } from "../tour.types";

export const CUSTOMER_ROUTE = "/customers/:customerId";
export const PROJECT_ROUTE = `${CUSTOMER_ROUTE}/projects/:projectId`;

/** CSS selector for a `data-tour` anchor. */
export const anchor = (tourId: string) => `[data-tour="${tourId}"]`;

/** Same, ignoring disabled controls (they can't be clicked to move on). */
export const enabledAnchor = (tourId: string) => `${anchor(tourId)}:not(:disabled)`;

/** A "click here" hint. The tour adds the Next reminder the first time it shows one. */
export const click = (
  element: string,
  title: string,
  description: string,
  optional = false,
): TourClickConfig => ({
  element,
  title,
  description,
  speechText: `${title}.`,
  optional,
});

/** A modal opened by a button. Closed through the shared Modal's backdrop. */
export const modal = (tourId: string, open: TourClickConfig, close?: string): TourPanelConfig => ({
  element: anchor(tourId),
  open,
  close,
});

/** A Radix dialog, closed through its own X unless it has another close control. */
export const dialog = (
  tourId: string,
  open: TourClickConfig,
  close = `${anchor(tourId)} > [data-slot="dialog-close"]`,
): TourPanelConfig => modal(tourId, open, close);
