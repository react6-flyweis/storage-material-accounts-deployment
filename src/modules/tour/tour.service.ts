import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";
import { tourSpeech, type SpeechState } from "./tour-speech.service";
import { useTourStore } from "./tour.store";
import type {
  TourClickConfig,
  TourDefinition,
  TourPanelConfig,
  TourStepBranchConfig,
  TourStepConfig,
  TourId,
} from "./tour.types";
import { NAV_ITEMS } from "@/config/navigation.config";
import { store } from "@/redux/store";
import { customerApi } from "@/redux/api/customerApi";
import { accountsOverviewTour } from "./tours/accounts-overview.tour";
import { paymentFlowTour } from "./tours/payment-flow.tour";
import { customerProjectTour } from "./tours/customer-project.tour";
import { financeGuideTour } from "./tours/finance-guide.tour";
import { incomeExpenseGuideTour } from "./tours/income-expense-guide.tour";
import { costGuideTour } from "./tours/cost-guide.tour";
import { invoiceGuideTour } from "./tours/invoice-guide.tour";
import { CUSTOMER_ROUTE, PROJECT_ROUTE } from "./tours/tour-helpers";
import { PAGE_INTROS } from "./tours/page-intros";

export const TOURS_REGISTRY: Record<TourId, TourDefinition> = {
  "accounts-overview": accountsOverviewTour,
  "payment-flow": paymentFlowTour,
  "customer-project": customerProjectTour,
  "finance-guide": financeGuideTour,
  "income-expense-guide": incomeExpenseGuideTour,
  "cost-guide": costGuideTour,
  "invoice-guide": invoiceGuideTour,
};

const DESKTOP_TOUR_WIDTH = 1024;
/** The layout's content area: everything but the sidebar and header. */
const PAGE_CONTENT = '[data-tour="page-content"]';
/** How long a page's first section may take before the page is introduced anyway. */
const PAGE_INTRO_WAIT_MS = 2500;
const OPTIONAL_STEP_TIMEOUT_MS = 1500;
const STEP_TIMEOUT_MS = 4000;
/** A page the tour just moved to may still be fetching its data. */
const PAGE_LOAD_TIMEOUT_MS = 8000;
const NAVIGATION_TIMEOUT_MS = 1500;
/** Lets a modal's entrance animation finish so the highlight fits it. */
const PANEL_SETTLE_MS = 350;
/** Added to the first "click here" hint of a run. */
const CLICK_NOTE = "Click it yourself, or press Next and we'll do it for you.";

function isTourTargetVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.isConnected) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  return true;
}

function stripPath(path: string): string {
  const clean = path.split("?")[0];
  return clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

/** The route of a page, whichever of its tabs or views is open. */
function pageRoute(route: string): string {
  return stripPath(route.split("?")[0]);
}

/** Scrolls a page, and whatever it scrolls in, back to the top. */
function scrollPageToTop(page: Element) {
  for (let node: Element | null = page; node; node = node.parentElement) {
    node.scrollTop = 0;
  }
}

function currentLocation(): string {
  return window.location.pathname + window.location.search;
}

/** Path segments that sit where a record ID would, but name a page instead. */
const RESERVED_SEGMENTS = new Set(["projects", "detail", "add", "edit"]);

/** Matches a path against a route pattern; `:param` segments match anything. */
function routeMatches(currentPath: string, pattern: string): boolean {
  if (!pattern) return true;
  const current = stripPath(currentPath);
  const target = stripPath(pattern);
  if (target === "/" || target === "/dashboard") {
    return current === "/" || current === "/dashboard";
  }
  const currentParts = current.split("/");
  const targetParts = target.split("/");
  if (currentParts.length !== targetParts.length) return false;
  return targetParts.every((part, i) =>
    part.startsWith(":") ? !RESERVED_SEGMENTS.has(currentParts[i]) : part === currentParts[i],
  );
}

interface TourProject {
  customerId: string;
  projectId: string;
}

/** How many customers to look through for one that has a project. */
const MAX_CUSTOMERS_CHECKED = 10;

function readProjectFromLocation(): TourProject | null {
  const [, section, customerId, page, projectId] = stripPath(window.location.pathname).split("/");
  return section === "customers" && page === "projects" && customerId && projectId
    ? { customerId, projectId }
    : null;
}

async function fetchFirstProject(): Promise<TourProject | null> {
  try {
    const { customers } = await store
      .dispatch(
        customerApi.endpoints.getCustomers.initiate(
          { page: 1, limit: MAX_CUSTOMERS_CHECKED },
          { subscribe: false },
        ),
      )
      .unwrap();

    for (const customer of customers) {
      if (customer.totalProjects === 0) continue;
      const { projects } = await store
        .dispatch(
          customerApi.endpoints.getCustomerDetail.initiate(customer._id, { subscribe: false }),
        )
        .unwrap();
      const projectId = projects?.[0]?.leadId;
      if (projectId) return { customerId: customer._id, projectId };
    }
  } catch (error) {
    console.warn("[Tour] Unable to resolve a project.", error);
  }
  return null;
}

function isSelectorVisible(selector: string): boolean {
  const element = document.querySelector(selector);
  return !!element && isTourTargetVisible(element);
}

/** Finds which sidebar tab (and sub-tab, if any) a route lives under. */
function findNavLocation(route: string): { tabIndex: number; subPath?: string; subLabel?: string } | null {
  const target = stripPath(route);
  for (let tabIndex = 0; tabIndex < NAV_ITEMS.length; tabIndex++) {
    const tab = NAV_ITEMS[tabIndex];
    if (tab.path && routeMatches(target, tab.path)) return { tabIndex };
    const sub = tab.items?.find((item) => stripPath(item.path) === target);
    if (sub) return { tabIndex, subPath: sub.path, subLabel: sub.label };
  }
  return null;
}

/** "Payment requests waiting…" → "payment requests waiting…", to follow a colon. */
function afterColon(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Builds the "click here" steps a user would take in the sidebar to get to
 * `targetRoute`, saying what the page is for when given a `purpose`. Empty when
 * the route isn't in the sidebar.
 */
function buildNavHints(targetRoute: string, purpose?: string): TourClickConfig[] {
  const target = findNavLocation(targetRoute);
  if (!target) return [];
  const tab = NAV_ITEMS[target.tabIndex];
  const about = purpose ? `: ${afterColon(purpose)}` : ".";
  const spokenAbout = purpose ? ` ${purpose}` : "";

  if (!target.subPath) {
    return [
      {
        element: `[data-tour-nav="${tab.title}"]`,
        title: `Go to ${tab.title}`,
        description: `Click the <b>${tab.title}</b> icon in the sidebar${about}`,
        speechText: `Click ${tab.title} in the sidebar.${spokenAbout}`,
      },
    ];
  }

  const hints: TourClickConfig[] = [];
  // Detail pages keep their section's side panel open, so the sub-tab may
  // already be one click away.
  const isSectionOpen = isSelectorVisible(`[data-tour-nav-sub="${target.subPath}"]`);
  // Opening a section lands on its first page, so that page needs no second click.
  const isFirstPage = tab.items?.[0].path === target.subPath;

  if (!isSectionOpen) {
    hints.push({
      element: `[data-tour-nav="${tab.title}"]`,
      title: `Go to ${tab.title}`,
      description: isFirstPage
        ? `Click the <b>${tab.title}</b> icon in the sidebar. It opens on <b>${target.subLabel}</b>${about}`
        : `Click the <b>${tab.title}</b> icon in the sidebar to open its pages.`,
      speechText: `Click ${tab.title} in the sidebar.${isFirstPage ? spokenAbout : ""}`,
    });
  }

  if (isSectionOpen || !isFirstPage) {
    hints.push({
      element: `[data-tour-nav-sub="${target.subPath}"]`,
      title: `Open ${target.subLabel}`,
      description: `Click <b>${target.subLabel}</b>${about}`,
      speechText: `Click ${target.subLabel}.${spokenAbout}`,
    });
  }

  return hints;
}

type HintResult = "clicked" | "missing" | "cancelled";

interface PopoverConfig {
  element: string | null;
  title: string;
  description: string;
  speechText: string;
  side?: TourStepConfig["side"];
  align?: TourStepConfig["align"];
  index: number;
  nextBtnText: string;
  branch?: TourStepBranchConfig;
  /** Blocks clicks on the highlighted element, so exploring can't change data. */
  locked?: boolean;
  /** Highlights a whole page rather than one part of it. */
  isPage?: boolean;
  /** Back works even on the first step, where it returns to the page intro. */
  canGoBack?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

interface ResumeTourContext {
  tourId: TourId;
  stepIndex: number;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class TourCoordinator {
  private driverObj: Driver | null = null;
  private navigate: NavigateFunction | null = null;
  private currentTour: TourDefinition | null = null;
  private stepToken = 0;
  private unsubscribe: (() => void) | null = null;
  private currentSpeechUnsub: (() => void) | null = null;
  private cancelPendingHint: (() => void) | null = null;
  /** What the visible popover narrates; replayed when audio is unmuted. */
  private currentSpeechText = "";
  /** Set while a branched tour runs; where to return when it ends. */
  private resumeContext: ResumeTourContext | null = null;
  /** Pages this run has already introduced, as a whole or in the hint leading there. */
  private introducedPages = new Set<string>();
  /** Whether this run has already explained what Next does on a click hint. */
  private clickNoteShown = false;
  /** Steps of the current tour that a page intro was shown before. */
  private pageIntroSteps = new Set<number>();
  /** Project the current tour is showing, so every step stays on the same one. */
  private tourProject: TourProject | null = null;
  /** Real paths of visited detail pages by route pattern, so Back can return to them. */
  private visitedPaths = new Map<string, string>();
  /** Pages whose click path was missing; their remaining steps are skipped too. */
  private unreachableRoutes = new Set<string>();
  /** Modals and tabs the tour has opened, outermost first. */
  private openPanels: TourPanelConfig[] = [];

  private cleanupSpeechSubscription() {
    if (this.currentSpeechUnsub) {
      this.currentSpeechUnsub();
      this.currentSpeechUnsub = null;
    }
  }

  private clearPendingHint() {
    if (this.cancelPendingHint) {
      const cancel = this.cancelPendingHint;
      this.cancelPendingHint = null;
      cancel();
    }
  }

  public init(navigate: NavigateFunction) {
    this.navigate = navigate;
    if (this.unsubscribe) return;

    this.unsubscribe = useTourStore.subscribe((state, previous) => {
      if (state.isAudioMuted === previous.isAudioMuted) return;
      if (state.isAudioMuted) {
        tourSpeech.stop("muted");
        return;
      }

      if (!this.currentTour || !this.currentSpeechText) return;
      tourSpeech.speak(this.currentSpeechText, false);
    });
  }

  private async waitForElement(
    selector: string,
    timeoutMs = STEP_TIMEOUT_MS,
  ): Promise<Element | null> {
    const existing = document.querySelector(selector);
    if (existing && isTourTargetVisible(existing)) return existing;

    return new Promise((resolve) => {
      let timeoutId = 0;
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element && isTourTargetVisible(element)) {
          window.clearTimeout(timeoutId);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      timeoutId = window.setTimeout(() => {
        observer.disconnect();
        const element = document.querySelector(selector);
        resolve(element && isTourTargetVisible(element) ? element : null);
      }, timeoutMs);
    });
  }

  public async startTour(
    tour: TourDefinition,
    startIndex = 0,
    resumeContext?: ResumeTourContext | null,
  ) {
    this.stopTour(false);
    if (resumeContext !== undefined) {
      this.resumeContext = resumeContext;
    } else {
      this.introducedPages.clear();
      this.clickNoteShown = false;
    }
    this.pageIntroSteps.clear();
    tourSpeech.prime();
    this.currentTour = tour;
    useTourStore.getState().setActiveTour(tour.id);

    if (window.innerWidth < DESKTOP_TOUR_WIDTH) {
      toast.info(
        "This tour is designed for desktop. Hidden navigation steps are skipped on smaller screens.",
      );
    }

    this.driverObj = driver({
      animate: true,
      allowClose: true,
      overlayClickBehavior: "none",
      overlayColor: "rgba(15, 23, 42, 0.7)",
      stagePadding: 8,
      stageRadius: 8,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish Tour ✓",
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      onDestroyed: (_element, _step, opts) => {
        if (opts.reason === "replaced") return;
        // Closed by driver.js itself (e.g. Escape) rather than through stopTour.
        if (this.driverObj) {
          this.driverObj = null;
          this.stopTour();
        }
        if (useTourStore.getState().activeTourId) {
          useTourStore.getState().setActiveTour(null);
        }
      },
    });

    await this.goToStep(startIndex);
  }

  /** Fills a route's params. Null if they can't be found. */
  private async resolveRoute(pattern: string): Promise<string | null> {
    if (!pattern.includes(":")) return pattern;
    if (routeMatches(currentLocation(), pattern)) return currentLocation();

    const visited = this.visitedPaths.get(pattern);
    if (visited) return visited;

    // Only customers and their projects can be reached without clicking a row first.
    if (!pattern.startsWith(CUSTOMER_ROUTE)) return null;
    const project = readProjectFromLocation() ?? this.tourProject ?? (await fetchFirstProject());
    if (!project) return null;
    this.tourProject = project;

    const route = pattern
      .replace(":customerId", project.customerId)
      .replace(":projectId", project.projectId);
    return route.includes(":") ? null : route;
  }

  private rememberRoute(pattern: string) {
    if (!pattern.includes(":") || !routeMatches(currentLocation(), pattern)) return;
    this.visitedPaths.set(pattern, window.location.pathname);
    if (pattern.startsWith(PROJECT_ROUTE)) {
      this.tourProject = readProjectFromLocation() ?? this.tourProject;
    }
  }

  private async waitForRoute(pattern: string): Promise<void> {
    const deadline = Date.now() + NAVIGATION_TIMEOUT_MS;
    while (!routeMatches(currentLocation(), pattern) && Date.now() < deadline) {
      await delay(50);
    }
  }

  private closePanelsFrom(depth: number) {
    while (this.openPanels.length > depth) {
      const panel = this.openPanels.pop();
      const root = panel && document.querySelector(panel.element);
      if (!panel || !root) continue;
      const closer = panel.close
        ? document.querySelector<HTMLElement>(panel.close)
        : root.closest<HTMLElement>("[data-modal-backdrop]");
      closer?.click();
    }
  }

  /** How many of the `wanted` panels are already open. */
  private countSharedPanels(wanted: TourPanelConfig[]): number {
    this.openPanels = this.openPanels.filter((panel) => document.querySelector(panel.element));
    let shared = 0;
    while (
      shared < wanted.length &&
      shared < this.openPanels.length &&
      this.openPanels[shared] === wanted[shared]
    ) {
      shared++;
    }
    return shared;
  }

  /** Opens the `panels` that aren't open yet, showing the click when `showClicks`. */
  private async openPanelsUpTo(
    panels: TourPanelConfig[],
    index: number,
    token: number,
    showClicks: boolean,
  ): Promise<HintResult> {
    for (const panel of panels.slice(this.openPanels.length)) {
      if (!isSelectorVisible(panel.element)) {
        if (showClicks) {
          const result = await this.showClickHint(panel.open, index, token);
          if (result !== "clicked") return result;
        } else {
          const trigger = await this.waitForElement(
            panel.open.element,
            panel.open.optional ? OPTIONAL_STEP_TIMEOUT_MS : STEP_TIMEOUT_MS,
          );
          if (token !== this.stepToken) return "cancelled";
          if (!(trigger instanceof HTMLElement)) return "missing";
          trigger.click();
        }

        const opened = await this.waitForElement(panel.element);
        if (token !== this.stepToken) return "cancelled";
        if (!opened) return "missing";
        this.openPanels.push(panel);
        await delay(panel.settleMs ?? PANEL_SETTLE_MS);
        if (token !== this.stepToken) return "cancelled";
        continue;
      }
      this.openPanels.push(panel);
    }
    return "clicked";
  }

  /** Passes over a step that has nothing to show, explaining it first if it must not be lost. */
  private handleMissing(step: TourStepConfig, index: number, direction: "forward" | "backward") {
    if (!step.whenMissing) {
      this.skipStep(index, direction);
      return;
    }
    this.presentStep(
      {
        ...step,
        description: `${step.description}<br><br><i>${step.whenMissing}</i>`,
        speechText: `${step.speechText || step.description} ${step.whenMissing}`,
      },
      index,
      null,
    );
  }

  private skipStep(index: number, direction: "forward" | "backward") {
    if (!this.currentTour) return;
    const nextIndex = direction === "forward" ? index + 1 : index - 1;
    if (nextIndex >= 0 && nextIndex < this.currentTour.steps.length) {
      void this.goToStep(nextIndex, direction);
    } else {
      this.completeTour();
    }
  }

  /** Leaves a tour that can't run (e.g. no projects yet), resuming the parent if any. */
  private abortTour(message: string) {
    toast.info(message);
    if (this.resumeContext) {
      const { tourId, stepIndex } = this.resumeContext;
      this.resumeContext = null;
      void this.startTour(TOURS_REGISTRY[tourId], stepIndex, null);
      return;
    }
    this.stopTour();
  }

  /** Shows the sidebar clicks that lead to `targetRoute`. False if the tour moved on. */
  private async walkSidebarTo(targetRoute: string, index: number, token: number): Promise<boolean> {
    const route = pageRoute(targetRoute);
    const purpose = this.introducedPages.has(route) ? undefined : PAGE_INTROS[route]?.description;
    const hints = buildNavHints(targetRoute, purpose);
    let lastResult: HintResult | null = null;
    for (let i = 0; i < hints.length; i++) {
      if (i > 0) {
        // The side panel slides its sub-items into place; let it settle
        // so the highlight lands on the final position.
        await delay(350);
        if (token !== this.stepToken) return false;
      }
      lastResult = await this.showClickHint(hints[i], index, token);
      if (lastResult === "cancelled") return false;
    }
    if (lastResult === "clicked") this.introducedPages.add(route);
    return true;
  }

  /**
   * Highlights the whole page before the tour goes through its sections, unless
   * the page was introduced already. False when there is nothing to introduce.
   */
  private async showPageIntro(
    step: TourStepConfig,
    index: number,
    token: number,
    replay: boolean,
  ): Promise<boolean> {
    const route = pageRoute(step.route);
    const intro = step.route ? PAGE_INTROS[route] : undefined;
    if (!intro) return false;
    if (!replay) {
      if (this.introducedPages.has(route)) return false;
      if (step.element === intro.coveredBy) {
        this.introducedPages.add(route);
        return false;
      }
    }

    // Let the page load, so the highlight fits it.
    await this.waitForElement(step.panels?.[0]?.open.element ?? step.element, PAGE_INTRO_WAIT_MS);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return true;
    const page = document.querySelector(PAGE_CONTENT);
    if (!page || !isTourTargetVisible(page)) return false;
    this.introducedPages.add(route);
    this.pageIntroSteps.add(index);
    scrollPageToTop(page);
    this.showPopover({
      element: PAGE_CONTENT,
      isPage: true,
      title: intro.title,
      description: intro.description,
      speechText: intro.description,
      index,
      nextBtnText: "Next →",
      locked: true,
      onNext: () => {
        if (token === this.stepToken) void this.goToStep(index, "forward");
      },
      onPrev: () => {
        // Coming forward again introduces the page again.
        this.introducedPages.delete(route);
        void this.goToStep(Math.max(0, index - 1), "backward");
      },
    });
    return true;
  }

  public async goToStep(
    index: number,
    direction: "forward" | "backward" = "forward",
    replayIntro = false,
  ) {
    if (!this.currentTour || !this.driverObj) return;
    const token = ++this.stepToken;
    this.clearPendingHint();
    const step = this.currentTour.steps[index];
    if (!step) {
      this.completeTour();
      return;
    }

    useTourStore.getState().setCurrentStepIndex(index);

    const isActive = () => token === this.stepToken && !!this.currentTour && !!this.driverObj;
    const showClicks = direction === "forward" && window.innerWidth >= DESKTOP_TOUR_WIDTH;

    const needsNavigation = !!step.route && !routeMatches(currentLocation(), step.route);

    // The control that leads to the page may itself be inside a modal.
    const viaPanels =
      showClicks && step.via && routeMatches(currentLocation(), step.via.fromRoute)
        ? step.via.panels
        : undefined;
    const sharedPanels = this.countSharedPanels(
      replayIntro ? [] : ((needsNavigation ? viaPanels : step.panels) ?? []),
    );
    if (this.openPanels.length > sharedPanels) {
      this.closePanelsFrom(sharedPanels);
      await delay(50);
      if (!isActive()) return;
    }

    if (needsNavigation && !step.via && this.unreachableRoutes.has(step.route)) {
      this.handleMissing(step, index, direction);
      return;
    }

    if (needsNavigation) {
      // Going forward on desktop, walk the user through the clicks instead of
      // jumping to the page, so they learn where it lives.
      if (showClicks && step.via) {
        const { via } = step;
        const viaNeedsNavigation = !routeMatches(currentLocation(), via.fromRoute);
        if (viaNeedsNavigation) {
          if (!(await this.walkSidebarTo(via.fromRoute, index, token))) return;
          const fromRoute = await this.resolveRoute(via.fromRoute);
          if (!isActive()) return;
          if (!fromRoute) {
            this.unreachableRoutes.add(step.route);
            this.handleMissing(step, index, direction);
            return;
          }
          if (this.navigate && !routeMatches(currentLocation(), via.fromRoute)) {
            this.navigate(fromRoute);
          }
        }

        let result = await this.openPanelsUpTo(via.panels ?? [], index, token, true);
        if (result === "clicked") {
          result = await this.showClickHint(
            via,
            index,
            token,
            viaNeedsNavigation ? PAGE_LOAD_TIMEOUT_MS : undefined,
          );
        }
        if (result === "cancelled") return;
        // The control isn't there (no invoices yet, no projects...),
        // so this page has nothing to show yet.
        if (result === "missing" && !via.openAnyway) {
          this.unreachableRoutes.add(step.route);
          this.handleMissing(step, index, direction);
          return;
        }
        this.unreachableRoutes.delete(step.route);
        if (result === "clicked") {
          this.introducedPages.add(pageRoute(step.route));
          await this.waitForRoute(step.route);
        }
        if (!isActive()) return;
        // Whatever the control was inside of belongs to the page just left.
        this.closePanelsFrom(0);
      } else if (showClicks) {
        if (!(await this.walkSidebarTo(step.route, index, token))) return;
      }

      const targetRoute = await this.resolveRoute(step.route);
      if (!isActive()) return;

      if (!targetRoute) {
        if (this.currentTour.requiresProject && step.route.startsWith(PROJECT_ROUTE) && !this.tourProject) {
          this.abortTour(
            `The ${this.currentTour.name} needs at least one customer with a project.`,
          );
          return;
        }
        console.info(`[Tour] Route not available for step: ${step.id}. Skipping.`);
        this.handleMissing(step, index, direction);
        return;
      }

      if (this.navigate && !routeMatches(currentLocation(), step.route)) {
        this.navigate(targetRoute);
        await this.waitForRoute(step.route);
        if (!isActive()) return;
      }
    }
    this.rememberRoute(step.route);

    if (direction === "forward" || replayIntro) {
      if (await this.showPageIntro(step, index, token, replayIntro)) return;
      if (!isActive()) return;
    }

    const panelResult = await this.openPanelsUpTo(step.panels ?? [], index, token, showClicks);
    if (panelResult === "cancelled" || !isActive()) return;
    if (panelResult === "missing") {
      this.handleMissing(step, index, direction);
      return;
    }

    const timeout = step.optional
      ? OPTIONAL_STEP_TIMEOUT_MS
      : needsNavigation
        ? PAGE_LOAD_TIMEOUT_MS
        : STEP_TIMEOUT_MS;
    const element = await this.waitForElement(step.element, timeout);
    if (!isActive()) return;

    if (!element) {
      console.warn(`[Tour] Element not found: ${step.element}. Skipping.`);
      this.handleMissing(step, index, direction);
      return;
    }

    this.presentStep(step, index, step.element);
  }

  /**
   * Highlights a control and waits until it is clicked, either by the user or
   * by the Next button.
   */
  private async showClickHint(
    hint: TourClickConfig,
    index: number,
    token: number,
    timeoutMs = hint.optional ? OPTIONAL_STEP_TIMEOUT_MS : STEP_TIMEOUT_MS,
  ): Promise<HintResult> {
    const element = await this.waitForElement(hint.element, timeoutMs);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return "cancelled";
    if (!element || !(element instanceof HTMLElement)) return "missing";

    const isSidebar = Boolean(element.closest('[data-tour="sidebar-nav"], [data-tour="sidepanel"]'));

    return new Promise<HintResult>((resolve) => {
      let isClicked = false;
      const note = this.clickNoteShown ? "" : ` ${CLICK_NOTE}`;
      this.clickNoteShown = true;
      const onClick = () => {
        isClicked = true;
        element.removeEventListener("click", onClick);
        this.cancelPendingHint = null;
        // Let the app's own click handler run (and navigate) before moving on.
        window.setTimeout(
          () => resolve(token === this.stepToken ? "clicked" : "cancelled"),
          0,
        );
      };
      element.addEventListener("click", onClick);
      this.cancelPendingHint = () => {
        element.removeEventListener("click", onClick);
        resolve("cancelled");
      };

      this.showPopover({
        element: hint.element,
        title: hint.title,
        description: `${hint.description}${note}`,
        speechText: hint.speechText || hint.title,
        side: isSidebar ? "right" : "bottom",
        align: "start",
        index,
        nextBtnText: "Next →",
        // A second Next while the page changes must not click it again.
        onNext: () => {
          if (!isClicked) element.click();
        },
        onPrev: () => void this.goToStep(Math.max(0, index - 1), "backward"),
      });
    });
  }

  /** Back from a page's first section leads to the page's intro. */
  private goBackFrom(index: number) {
    if (this.pageIntroSteps.has(index)) {
      void this.goToStep(index, "backward", true);
      return;
    }
    void this.goToStep(Math.max(0, index - 1), "backward");
  }

  private presentStep(
    step: TourStepConfig,
    index: number,
    element: string | null,
  ) {
    if (!this.currentTour) return;
    const token = this.stepToken;
    const isLast = index === this.currentTour.steps.length - 1;
    const returnsToParent = isLast && this.resumeContext !== null;
    const parentName = this.resumeContext
      ? TOURS_REGISTRY[this.resumeContext.tourId].name
      : "";

    this.showPopover({
      element,
      title: step.title,
      description: returnsToParent
        ? `${step.description}<br><br>You've finished the <b>${this.currentTour.name}</b>. Press Continue to return to the ${parentName}.`
        : step.description,
      speechText: returnsToParent
        ? `${step.speechText || step.description} You've finished the ${this.currentTour.name}. Press continue to return to the main walkthrough.`
        : step.speechText || step.description,
      side: step.side,
      align: step.align,
      index,
      nextBtnText: returnsToParent
        ? "Continue Walkthrough →"
        : isLast
          ? "Finish Tour ✓"
          : "Next →",
      branch: step.branch,
      locked: step.locked ?? !!step.panels?.length,
      // A second Next while the next step loads must not start it over.
      onNext: () => {
        if (token === this.stepToken) void this.goToStep(index + 1, "forward");
      },
      canGoBack: this.pageIntroSteps.has(index),
      onPrev: () => this.goBackFrom(index),
    });
  }

  private startBranch(branch: TourStepBranchConfig, index: number) {
    if (!this.currentTour) return;
    const parent = this.currentTour;
    const targetTour = TOURS_REGISTRY[branch.tourId];
    if (!targetTour) return;
    const resumeIndex = parent.steps.findIndex((step) => step.id === branch.resumeStepId);
    const resume: ResumeTourContext = {
      tourId: parent.id,
      stepIndex: resumeIndex >= 0 ? resumeIndex : index + 1,
    };
    // The step the branch was offered on has just been explained.
    const { route, element } = parent.steps[index];
    const steps = targetTour.steps.filter(
      (step) => step.via || step.panels || step.route !== route || step.element !== element,
    );
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    void this.startTour({ ...targetTour, steps }, 0, resume);
  }

  private renderBranch(wrapper: HTMLElement, footer: HTMLElement | undefined, branch: TourStepBranchConfig | undefined, index: number) {
    wrapper.querySelector(".tour-branch-container")?.remove();
    if (!branch) return;

    const box = document.createElement("div");
    box.className = "tour-branch-container";

    const prompt = document.createElement("div");
    prompt.className = "tour-branch-prompt";
    prompt.textContent =
      branch.description || "Want a closer look? Take the detailed guide, then come back here.";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tour-branch-btn";
    btn.textContent = `${branch.label} →`;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.startBranch(branch, index);
    };

    box.append(prompt, btn);
    if (footer && footer.parentNode === wrapper) {
      wrapper.insertBefore(box, footer);
    } else {
      wrapper.appendChild(box);
    }
  }

  private showPopover(config: PopoverConfig) {
    if (!this.currentTour || !this.driverObj) return;
    const { element, index } = config;

    if (element) {
      const domEl = document.querySelector(element);
      if (domEl && !config.isPage) {
        domEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const total = this.currentTour.steps.length;
    const isFirst = index === 0;
    const speech = config.speechText;
    this.currentSpeechText = speech;

    this.driverObj.highlight({
      ...(element ? { element } : {}),
      disableActiveInteraction: config.locked ?? false,
      popover: {
        title: config.title,
        description: config.description,
        side: config.side || "bottom",
        align: config.align || "start",
        showButtons: ["next", "previous", "close"],
        disableButtons: isFirst && !config.canGoBack ? ["previous"] : [],
        showProgress: true,
        progressText: `${index + 1} of ${total}`,
        nextBtnText: config.nextBtnText,
        prevBtnText: "← Back",
        onPopoverRender: (popoverDOM) => {
          this.cleanupSpeechSubscription();

          this.renderBranch(popoverDOM.wrapper, popoverDOM.footer, config.branch, index);

          let badge = popoverDOM.wrapper.querySelector<HTMLButtonElement>(
            ".tour-speaker-status-badge",
          );
          if (!badge) {
            badge = document.createElement("button");
            badge.type = "button";
            badge.className = "tour-speaker-status-badge";
            badge.setAttribute("aria-label", "Tour speech status");
            if (popoverDOM.title && popoverDOM.title.parentNode) {
              popoverDOM.wrapper.insertBefore(badge, popoverDOM.title);
            } else {
              popoverDOM.wrapper.prepend(badge);
            }
          }

          const updateBadge = (state: SpeechState) => {
            if (!badge) return;
            badge.className = `tour-speaker-status-badge ${state}`;
            if (state === "speaking") {
              badge.innerHTML = `<span class="tour-pulse-dot"></span><span>🔊 Voice: Speaking...</span>`;
              badge.title = "Audio guide is playing (Click to mute)";
            } else if (state === "finished") {
              badge.innerHTML = `<span>✓ Voice: Finished</span>`;
              badge.title = "Audio guide completed (Click to replay)";
            } else if (state === "muted") {
              badge.innerHTML = `<span>🔇 Voice: Muted</span>`;
              badge.title = "Audio is muted (Click to unmute and play)";
            } else {
              badge.innerHTML = `<span>🔈 Voice: Ready</span>`;
              badge.title = "Click to play audio guidance";
            }
          };

          badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            tourSpeech.prime();
            const currentState = tourSpeech.getState();
            const currentlyMuted = useTourStore.getState().isAudioMuted;

            if (currentState === "finished" && !currentlyMuted) {
              tourSpeech.speak(speech, false);
              return;
            }

            useTourStore.getState().toggleAudioMute();
          };

          this.currentSpeechUnsub = tourSpeech.onStateChange((state) => {
            updateBadge(state);
          });
        },
        onNextClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          config.onNext();
        },
        onPrevClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          config.onPrev();
        },
        onCloseClick: () => {
          this.cleanupSpeechSubscription();
          this.stopTour();
        },
      },
    });

    const isMuted = useTourStore.getState().isAudioMuted;
    tourSpeech.speak(speech, isMuted);
  }

  public completeTour() {
    const finishedTour = this.currentTour;
    if (finishedTour) {
      useTourStore.getState().markTourCompleted(finishedTour.id);
    }

    if (this.resumeContext) {
      const { tourId, stepIndex } = this.resumeContext;
      this.resumeContext = null;
      const parentTour = TOURS_REGISTRY[tourId];
      toast.success(
        `${finishedTour?.name || "Guide"} complete! Resuming ${parentTour.name}...`,
      );
      void this.startTour(parentTour, stepIndex, null);
      return;
    }

    this.stopTour();
  }

  public stopTour(clearResume = true) {
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    this.stepToken += 1;
    this.clearPendingHint();
    this.closePanelsFrom(0);
    if (clearResume) {
      this.resumeContext = null;
      this.tourProject = null;
      this.visitedPaths.clear();
      this.unreachableRoutes.clear();
    }
    if (this.driverObj) {
      const activeDriver = this.driverObj;
      this.driverObj = null;
      this.currentTour = null;
      activeDriver.destroy();
      return;
    }
    this.currentTour = null;
  }
}

export const tourCoordinator = new TourCoordinator();
