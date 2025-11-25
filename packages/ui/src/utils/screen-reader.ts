/**
 * Screen Reader Accessibility Utilities
 * Provides helpers for screen reader announcements and ARIA management
 */

// Live region for dynamic announcements
let liveRegion: HTMLElement | null = null;

/**
 * Initialize the screen reader live region
 * Should be called once on app mount
 */
export function initScreenReaderSupport(): void {
  if (typeof document === "undefined") return;
  if (liveRegion) return;

  liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(liveRegion);
}

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' for non-urgent, 'assertive' for urgent
 */
export function announce(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;

  // Create temporary announcement element
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Announce loading state
 */
export function announceLoading(resourceName?: string): void {
  const message = resourceName ? `Loading ${resourceName}` : "Loading";
  announce(message, "polite");
}

/**
 * Announce loading complete
 */
export function announceLoadingComplete(resourceName?: string, count?: number): void {
  let message = resourceName ? `${resourceName} loaded` : "Content loaded";
  if (count !== undefined) {
    message += `. ${count} item${count !== 1 ? "s" : ""} found`;
  }
  announce(message, "polite");
}

/**
 * Announce error
 */
export function announceError(errorMessage: string): void {
  announce(`Error: ${errorMessage}`, "assertive");
}

/**
 * Announce success
 */
export function announceSuccess(successMessage: string): void {
  announce(successMessage, "polite");
}

/**
 * Announce navigation
 */
export function announceNavigation(pageName: string): void {
  announce(`Navigated to ${pageName}`, "polite");
}

/**
 * Announce form validation error
 */
export function announceValidationError(fieldName: string, error: string): void {
  announce(`${fieldName}: ${error}`, "assertive");
}

/**
 * Announce modal opened
 */
export function announceModalOpened(modalTitle: string): void {
  announce(`Dialog opened: ${modalTitle}`, "polite");
}

/**
 * Announce modal closed
 */
export function announceModalClosed(): void {
  announce("Dialog closed", "polite");
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix: string = "aria"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if high contrast mode is active
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

/**
 * Get current color scheme preference
 */
export function getColorSchemePreference(): "light" | "dark" | "no-preference" {
  if (typeof window === "undefined") return "no-preference";
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "no-preference";
}

/**
 * ARIA attribute helpers
 */
export const ariaHelpers = {
  /**
   * Generate describedby attribute value from multiple IDs
   */
  describedBy: (...ids: (string | undefined | null)[]): string | undefined => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(" ") : undefined;
  },

  /**
   * Generate labelledby attribute value from multiple IDs
   */
  labelledBy: (...ids: (string | undefined | null)[]): string | undefined => {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(" ") : undefined;
  },

  /**
   * Get appropriate role for interactive element
   */
  getInteractiveRole: (
    element: "button" | "link" | "checkbox" | "radio" | "switch" | "tab" | "menuitem"
  ): string => {
    return element;
  },

  /**
   * Generate aria-label for icon-only buttons
   */
  iconButtonLabel: (action: string, target?: string): string => {
    return target ? `${action} ${target}` : action;
  },
};

/**
 * Focus management utilities
 */
export const focusHelpers = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      "[contenteditable]",
    ].join(", ");

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  },

  /**
   * Get first focusable element
   */
  getFirstFocusable: (container: HTMLElement): HTMLElement | null => {
    const elements = focusHelpers.getFocusableElements(container);
    return elements[0] || null;
  },

  /**
   * Get last focusable element
   */
  getLastFocusable: (container: HTMLElement): HTMLElement | null => {
    const elements = focusHelpers.getFocusableElements(container);
    return elements[elements.length - 1] || null;
  },

  /**
   * Trap focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;

    const focusableElements = focusHelpers.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  },

  /**
   * Save and restore focus (for modals)
   */
  saveFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement | null;
  },

  restoreFocus: (element: HTMLElement | null): void => {
    if (element && typeof element.focus === "function") {
      element.focus();
    }
  },
};

/**
 * Skip link management
 */
export function createSkipLinks(targets: { id: string; label: string }[]): void {
  if (typeof document === "undefined") return;

  const existingNav = document.querySelector(".skip-links");
  if (existingNav) return;

  const nav = document.createElement("nav");
  nav.className = "skip-links";
  nav.setAttribute("aria-label", "Skip links");
  nav.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
  `;

  targets.forEach(({ id, label }) => {
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = label;
    link.className = "skip-link";
    link.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      padding: 0.5rem 1rem;
      background: #000;
      color: #fff;
      text-decoration: none;
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      z-index: 9999;
    `;

    link.addEventListener("focus", () => {
      link.style.left = "0";
    });

    link.addEventListener("blur", () => {
      link.style.left = "-9999px";
    });

    nav.appendChild(link);
  });

  document.body.insertBefore(nav, document.body.firstChild);
}

const screenReaderUtils = {
  initScreenReaderSupport,
  announce,
  announceLoading,
  announceLoadingComplete,
  announceError,
  announceSuccess,
  announceNavigation,
  announceValidationError,
  announceModalOpened,
  announceModalClosed,
  generateAriaId,
  prefersReducedMotion,
  prefersHighContrast,
  getColorSchemePreference,
  ariaHelpers,
  focusHelpers,
  createSkipLinks,
};

export default screenReaderUtils;
