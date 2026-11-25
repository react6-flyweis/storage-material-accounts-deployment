/**
 * `onInteractOutside` for Radix dialogs the tour opens: its popover lies outside
 * the dialog, so using it (e.g. muting the voice) would otherwise close it.
 */
export function keepOpenDuringTour(event: Event) {
  if (event.target instanceof Element && event.target.closest(".driver-popover")) {
    event.preventDefault();
  }
}
